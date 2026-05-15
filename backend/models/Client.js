const mongoose = require('mongoose');
const clientSchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  name:{type:String,required:true,trim:true},
  company:{type:String,trim:true},
  email:{type:String,trim:true,lowercase:true},
  phone:{type:String,trim:true},
  address:{type:String,trim:true},
  gstin:{type:String,trim:true},
  category:{type:String,enum:['individual','business','government','startup'],default:'business'},
  tags:[String],notes:String,
  status:{type:String,enum:['active','inactive'],default:'active'},
  totalBilled:{type:Number,default:0},
  totalPaid:{type:Number,default:0},
  invoiceCount:{type:Number,default:0},
  lastInvoiceDate:Date,
  createdAt:{type:Date,default:Date.now},
  updatedAt:{type:Date,default:Date.now}
});
clientSchema.pre('save',function(next){this.updatedAt=new Date();next()});
module.exports=mongoose.model('Client',clientSchema);
