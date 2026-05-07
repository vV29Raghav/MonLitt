import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema, model } = mongoose

// ── User ──────────────────────────────────────────────────────────────
const userSchema = new Schema({
  name:         { type:String, required:true, trim:true, maxlength:60 },
  email:        { type:String, required:true, unique:true, lowercase:true, trim:true },
  passwordHash: { type:String, required:true, select:false },
  avatar:       { type:String, default:null },
  color:        { type:String, default:'#22a05a' },
  currency:     { type:String, default:'INR', enum:['INR','USD','EUR','GBP'] },
  friends:      [{ type:Schema.Types.ObjectId, ref:'User' }],
  groups:       [{ type:Schema.Types.ObjectId, ref:'Group' }],
  isVerified:   { type:Boolean, default:false },
  refreshToken: { type:String, select:false },
}, { timestamps:true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

userSchema.methods.toPublic = function() {
  const { passwordHash, refreshToken, __v, ...pub } = this.toObject()
  return pub
}

export const User = model('User', userSchema)

// ── Group ─────────────────────────────────────────────────────────────
const groupSchema = new Schema({
  name:      { type:String, required:true, trim:true, maxlength:60 },
  icon:      { type:String, default:'👥' },
  category:  { type:String, enum:['Trip','Home','Office','Other'], default:'Other' },
  createdBy: { type:Schema.Types.ObjectId, ref:'User', required:true },
  members: [{
    user:    { type:Schema.Types.ObjectId, ref:'User' },
    role:    { type:String, enum:['admin','member'], default:'member' },
    joinedAt:{ type:Date, default:Date.now },
  }],
  // userId → net balance (positive = owed to them, negative = they owe)
  balances:  { type:Map, of:Number, default:{} },
  currency:  { type:String, default:'INR' },
  isArchived:{ type:Boolean, default:false },
}, { timestamps:true })

groupSchema.index({ 'members.user': 1 })
groupSchema.index({ createdBy: 1 })

export const Group = model('Group', groupSchema)

// ── Expense ───────────────────────────────────────────────────────────
const splitSchema = new Schema({
  user:    { type:Schema.Types.ObjectId, ref:'User', required:true },
  amount:  { type:Number, required:true, min:0 },
  percent: { type:Number, default:0 },
  shares:  { type:Number, default:1 },
}, { _id:false })

const expenseSchema = new Schema({
  groupId:     { type:Schema.Types.ObjectId, ref:'Group', index:true },
  description: { type:String, required:true, trim:true, maxlength:120 },
  amount:      { type:Number, required:true, min:0.01 },
  currency:    { type:String, default:'INR' },
  paidBy:      { type:Schema.Types.ObjectId, ref:'User', required:true },
  splitType:   { type:String, enum:['equal','exact','percentage','shares'], default:'equal' },
  splits:      [splitSchema],
  category:    { type:String, default:'other' },
  note:        { type:String, maxlength:500 },
  receiptUrl:  { type:String, default:null },
  date:        { type:Date, default:Date.now },
  createdBy:   { type:Schema.Types.ObjectId, ref:'User' },
}, { timestamps:true })

expenseSchema.index({ groupId:1, date:-1 })
expenseSchema.index({ paidBy:1 })

export const Expense = model('Expense', expenseSchema)

// ── Settlement ────────────────────────────────────────────────────────
const settlementSchema = new Schema({
  groupId:  { type:Schema.Types.ObjectId, ref:'Group', required:true, index:true },
  fromUser: { type:Schema.Types.ObjectId, ref:'User',  required:true },
  toUser:   { type:Schema.Types.ObjectId, ref:'User',  required:true },
  amount:   { type:Number, required:true, min:0.01 },
  currency: { type:String, default:'INR' },
  note:     { type:String, maxlength:200 },
  status:   { type:String, enum:['pending','completed'], default:'completed' },
  paidAt:   { type:Date, default:Date.now },
}, { timestamps:true })

settlementSchema.index({ groupId:1, fromUser:1, toUser:1 })

export const Settlement = model('Settlement', settlementSchema)

// ── Notification ──────────────────────────────────────────────────────
const notificationSchema = new Schema({
  userId:  { type:Schema.Types.ObjectId, ref:'User', required:true, index:true },
  type:    { type:String, enum:['expense','settlement','invite','reminder','system'], default:'system' },
  title:   { type:String, required:true },
  message: { type:String, required:true },
  read:    { type:Boolean, default:false, index:true },
  refId:   { type:Schema.Types.ObjectId },        // optional reference
  refType: { type:String },                        // e.g. 'Expense', 'Group'
}, { timestamps:true })

notificationSchema.index({ userId:1, read:1 })

export const Notification = model('Notification', notificationSchema)
