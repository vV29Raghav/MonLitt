/**
 * Balance Engine
 * Calculates per-user balances for a group and simplifies debts
 * using a greedy min-transactions algorithm (O(n log n)).
 */

/**
 * Calculate net balances from a list of expenses.
 * Returns a Map<userId, netAmount>
 * Positive = others owe them | Negative = they owe others
 */
export function calcBalances(expenses) {
  const balances = new Map()

  const add = (id, amount) => {
    const key = String(id)
    balances.set(key, (balances.get(key) || 0) + amount)
  }

  for (const exp of expenses) {
    const payer = String(exp.paidBy)
    add(payer, exp.amount)  // Payer gets credit for the full amount

    for (const split of exp.splits) {
      add(String(split.user), -split.amount)  // Each person (including payer if in splits) owes their share
    }
  }

  // Round to 2 decimal places to avoid floating point issues
  for (const [key, val] of balances.entries()) {
    balances.set(key, Math.round(val * 100) / 100)
  }

  return balances
}

/**
 * Greedy debt simplification.
 * Input:  { userId: netBalance, ... }
 * Output: [{ from, to, amount }, ...]  — minimal transactions
 */
export function simplifyDebts(balancesObj) {
  const entries = Object.entries(balancesObj)
    .map(([id, bal]) => ({ id, bal }))
    .filter(e => Math.abs(e.bal) > 0.01)

  const creditors = entries.filter(e => e.bal > 0).sort((a, b) => b.bal - a.bal)
  const debtors = entries.filter(e => e.bal < 0).sort((a, b) => a.bal - b.bal)

  const txns = []
  let i = 0 // creditor index
  let j = 0 // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]
    const amount = Math.min(creditor.bal, -debtor.bal)

    if (amount > 0.01) {
      txns.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100,
      })
    }

    creditor.bal -= amount
    debtor.bal += amount

    if (creditor.bal < 0.01) i++
    if (-debtor.bal < 0.01) j++
  }

  return txns
}

/**
 * Recalculate all balances for a group and persist to the Group document.
 * Call this after every expense add/edit/delete.
 */
export async function recalcGroupBalances(groupId, GroupModel, ExpenseModel) {
  const expenses = await ExpenseModel.find({ groupId })
  const balances = calcBalances(expenses)
  const balancesObj = Object.fromEntries(balances)
  
  await GroupModel.findByIdAndUpdate(groupId, { balances: balancesObj })
  return balances
}

/**
 * Build splits array from expense data.
 */
export function buildSplits({ amount, splitType, memberIds, exactAmounts, percentages, sharesMap }) {
  const n = memberIds.length
  if (n === 0) return []

  switch (splitType) {
    case 'equal': {
      const each = Math.floor((amount * 100) / n) / 100
      let rem = Math.round((amount - each * n) * 100) / 100
      
      return memberIds.map((id, i) => {
        let val = each
        if (rem > 0) {
          val += 0.01
          rem = Math.round((rem - 0.01) * 100) / 100
        }
        return { user: id, amount: Math.round(val * 100) / 100 }
      })
    }

    case 'exact': {
      const total = memberIds.reduce((s, id) => s + (exactAmounts[id] || 0), 0)
      if (Math.abs(total - amount) > 0.01) throw new Error('Exact amounts must sum to total')
      return memberIds.map(id => ({ user: id, amount: Math.round((exactAmounts[id] || 0) * 100) / 100 }))
    }

    case 'percentage': {
      const sumPct = memberIds.reduce((s, id) => s + (percentages[id] || 0), 0)
      if (Math.abs(sumPct - 100) > 0.01) throw new Error('Percentages must sum to 100')
      
      let distributed = 0
      const splits = memberIds.map((id, i) => {
        const val = i === n - 1 
          ? Math.round((amount - distributed) * 100) / 100
          : Math.round((percentages[id] || 0) / 100 * amount * 100) / 100
        distributed += val
        return { user: id, amount: val, percent: percentages[id] || 0 }
      })
      return splits
    }

    case 'shares': {
      const totalShares = memberIds.reduce((s, id) => s + (sharesMap[id] || 0), 0)
      if (totalShares === 0) throw new Error('Total shares cannot be zero')
      
      let distributed = 0
      const splits = memberIds.map((id, i) => {
        const s = sharesMap[id] || 0
        const val = i === n - 1 && s > 0
          ? Math.round((amount - distributed) * 100) / 100
          : Math.round((s / totalShares * amount) * 100) / 100
        distributed += val
        return { user: id, amount: val, shares: s }
      })
      return splits
    }

    default:
      throw new Error(`Unknown split type: ${splitType}`)
  }
}
