import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function RazorpayButton({ doc, onPaid }) {
    const [loading, setLoading] = useState(false)

    const loadScript = () => new Promise(resolve => {
        if (window.Razorpay) return resolve(true)
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => resolve(true)
        s.onerror = () => resolve(false)
        document.body.appendChild(s)
    })

    const handlePay = async () => {
        setLoading(true)
        try {
            const loaded = await loadScript()
            if (!loaded) return toast.error('Razorpay failed to load')
            const { data } = await api.post('/payments/create-order/' + doc._id)
            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency || 'INR',
                name: 'InvoiceAI',
                description: 'Payment for ' + doc.documentNumber,
                order_id: data.order.id,
                prefill: {
                    name: doc.clientInfo?.name || '',
                    email: doc.clientInfo?.email || '',
                    contact: doc.clientInfo?.phone || ''
                },
                theme: { color: '#16a34a' },
                handler: async (response) => {
                    try {
                        const verify = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            documentId: doc._id
                        })
                        toast.success('Payment successful!')
                        if (onPaid) onPaid(verify.data.document)
                    } catch { toast.error('Verification failed') }
                },
                modal: { ondismiss: () => { setLoading(false) } }
            }
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Payment setup failed')
        } finally { setLoading(false) }
    }

    if (doc.status === 'paid') return (
        <div style={{padding:'12px',background:'#dcfce7',border:'1px solid #86efac',borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:4}}>✅</div>
            <div style={{fontSize:'0.82rem',fontWeight:600,color:'#15803d'}}>Invoice Paid</div>
        </div>
    )

    return (
        <button onClick={handlePay} disabled={loading} className="btn btn-primary"
                style={{width:'100%',justifyContent:'center',background:'linear-gradient(135deg,#1a1a2e,#16213e)',fontSize:'0.85rem'}}>
            {loading ? <><span className="spinner"/>Setting up...</> : '💳 Pay Now via Razorpay'}
        </button>
    )
}