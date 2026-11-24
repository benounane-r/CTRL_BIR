import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

const LIBRARY_QR_TEXT = 'SMART_ATLAS_LIBRARY'
const MAX_BREAK_MINUTES = 30
const PENDING_MINUTES = 5 // QR okutulmayan rezervasyon bu süre sonra silinir

let reservations = []

// Rezervasyon oluştur
app.post('/api/reservations', (req, res) => {
  const reservation = {
    ...req.body,
    id: Date.now().toString(),
    verified: false,
    onBreak: false,
    breakEndsAt: null,
    createdAt: Date.now()
  }

  reservations.push(reservation)

  res.json({
    success: true,
    reservation
  })
})

// Rezervasyonları getir
app.get('/api/reservations', (req, res) => {
  res.json(reservations)
})

// QR doğrulama
app.post('/api/verify-qr', (req, res) => {
  const { reservationId, qrText } = req.body

  if (qrText !== LIBRARY_QR_TEXT) {
    return res.status(400).json({
      success: false,
      message: 'Invalid library QR code'
    })
  }

  const reservation = reservations.find(
    r => r.id === reservationId && !r.verified
  )

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Invalid reservation'
    })
  }

  reservation.verified = true

  res.json({
    success: true,
    message: 'Reservation verified!',
    reservation
  })
})

// Mola başlat / bitir
app.post('/api/reservations/:id/break', (req, res) => {
  const reservation = reservations.find(
    r => String(r.id) === req.params.id
  )

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    })
  }

  if (!reservation.verified) {
    return res.status(400).json({
      success: false,
      message: 'Verify the QR code before taking a break'
    })
  }

  const { start, minutes } = req.body

  if (start) {
    const breakMinutes = Number(minutes)

    if (!breakMinutes || breakMinutes <= 0 || breakMinutes > MAX_BREAK_MINUTES) {
      return res.status(400).json({
        success: false,
        message: `Break must be between 1 and ${MAX_BREAK_MINUTES} minutes`
      })
    }

    reservation.onBreak = true
    reservation.breakEndsAt = Date.now() + breakMinutes * 60 * 1000
  } else {
    reservation.onBreak = false
    reservation.breakEndsAt = null
  }

  res.json({
    success: true,
    reservation
  })
})

// Çıkış: rezervasyonu sil
app.delete('/api/reservations/:id', (req, res) => {
  const index = reservations.findIndex(
    r => String(r.id) === req.params.id
  )

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    })
  }

  reservations.splice(index, 1)

  res.json({
    success: true
  })
})

// Her saniye: süresi dolan molaları ve QR okutulmamış rezervasyonları sil
setInterval(() => {
  const current = Date.now()

  reservations = reservations.filter(r => {
    const breakExpired = r.onBreak && r.breakEndsAt <= current
    const pendingExpired =
      !r.verified && current - r.createdAt > PENDING_MINUTES * 60 * 1000

    return !breakExpired && !pendingExpired
  })
}, 1000)

app.listen(3001, '0.0.0.0', () => {
  console.log('Smart Atlas server running on port 3001')
})