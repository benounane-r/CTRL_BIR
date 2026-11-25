
import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import API_URL from '../../config/api.js'
import './library.css'

const BREAK_OPTIONS = [5, 10, 15, 20, 30]
const QR_TEXT = 'SMART_ATLAS_LIBRARY'

export default function LibraryPage() {
  const [reservationId, setReservationId] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:00')
  const [reservationStep, setReservationStep] = useState(1)
  const [reservations, setReservations] = useState([])
  const [now, setNow] = useState(Date.now())
  const [breakMinutes, setBreakMinutes] = useState(15)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedTime, setSelectedTime] = useState('14:00')

  const today = new Date().toLocaleDateString('tr-TR')

  const occupiedSeats = [
    'T1-S3', 'T1-S12', 'T3-S7', 'T5-S15',
    'T7-S4', 'T8-S10', 'T10-S2', 'T12-S17'
  ]

  const roomBookings = {
    1: { '14:00': 4, '15:00': 0, '16:00': 2 },
    2: { '14:00': 6, '15:00': 0, '16:00': 0 }
  }

  async function fetchReservations() {
    try {
      const response = await fetch(`${API_URL}/reservations`)
      if (!response.ok) throw new Error('Reservation request failed')

      const data = await response.json()
      if (Array.isArray(data)) setReservations(data)
    } catch (error) {
      console.error('Reservation update error:', error)
    }
  }

  useEffect(() => {
    fetchReservations()
    const interval = setInterval(fetchReservations, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (reservationStep !== 4) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    )

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {})
        verifyQRCode(decodedText)
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [reservationStep])

  function getRoomPeople(roomNumber) {
    return roomBookings[roomNumber]?.[selectedTime] ?? 0
  }

  function hasReservationConflict(seatId, start, end) {
    return reservations.some((reservation) => {
      if (reservation.seatId !== seatId) return false
      if (reservation.date !== today) return false

      return start < reservation.endTime &&
        end > reservation.startTime
    })
  }

  async function toggleBreak(id, onBreak) {
    try {
      const response = await fetch(
        `${API_URL}/reservations/${id}/break`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: !onBreak,
            minutes: breakMinutes
          })
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false) {
        alert(data.message || 'Break action failed!')
        return
      }

      await fetchReservations()
    } catch (error) {
      console.error('Break error:', error)
      alert('Server connection failed!')
    }
  }

  async function checkOut(id) {
    try {
      const response = await fetch(
        `${API_URL}/reservations/${id}`,
        { method: 'DELETE' }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false) {
        alert(data.message || 'Exit failed!')
        return
      }

      await fetchReservations()
    } catch (error) {
      console.error('Exit error:', error)
      alert('Server connection failed!')
    }
  }

  function formatRemaining(endsAt) {
    const totalSeconds = Math.max(
      0,
      Math.ceil((endsAt - now) / 1000)
    )

    const minutes = String(
      Math.floor(totalSeconds / 60)
    ).padStart(2, '0')

    const seconds = String(
      totalSeconds % 60
    ).padStart(2, '0')

    return `${minutes}:${seconds}`
  }

  async function verifyQRCode(decodedText) {
    if (decodedText !== QR_TEXT) {
      alert('Invalid library QR code!')
      return
    }

    try {
      const response = await fetch(`${API_URL}/verify-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          qrText: decodedText
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        alert(data.message || 'QR verification failed!')
        return
      }

      setReservationStep(5)
      await fetchReservations()
    } catch (error) {
      console.error('QR verification error:', error)
      alert('Server connection failed!')
    }
  }

  function renderTable(tableNumber) {
    const seats = (side) => (
      <div className="seat-row">
        {Array.from({ length: 9 }, (_, index) => {
          const seatNumber = side === 'top'
            ? index + 1
            : index + 10

          const seatId = `T${tableNumber}-S${seatNumber}`

          const reservation = reservations.find(
            (r) => r.seatId === seatId && r.date === today
          )

          const isOnBreak = reservation?.onBreak
          const isOccupied =
            occupiedSeats.includes(seatId) || Boolean(reservation)

          const isSelected = selectedSeat === seatId

          return (
            <button
              key={seatId}
              className={`seat ${
                isOnBreak ? 'on-break' :
                isOccupied ? 'occupied' : 'available'
              } ${isSelected ? 'selected' : ''}`}
              disabled={isOccupied}
              onClick={() => {
                setSelectedSeat(seatId)
                setSelectedRoom(null)
              }}
              title={`${tableNumber}. masa - ${seatNumber}. koltuk`}
            >
              {seatNumber}
            </button>
          )
        })}
      </div>
    )

    return (
      <div className="table-group" key={tableNumber}>
        <div className="table-label">
          TABLE {String(tableNumber).padStart(2, '0')}
        </div>

        {seats('top')}

        <div className="study-table">
          <span>TABLE {tableNumber}</span>
        </div>

        {seats('bottom')}
      </div>
    )
  }

  function renderRoom(roomNumber) {
    const people = getRoomPeople(roomNumber)
    const isOccupied = people > 0
    const isSelected = selectedRoom === roomNumber

    return (
      <button
        key={roomNumber}
        className={`group-room ${
          isOccupied ? 'room-occupied' : 'room-available'
        } ${isSelected ? 'room-selected' : ''}`}
        disabled={isOccupied}
        onClick={() => {
          setSelectedRoom(roomNumber)
          setSelectedSeat(null)
        }}
      >
        <h3>GROUP ROOM 0{roomNumber}</h3>
        <div className="room-capacity">{people}/6 PEOPLE</div>
        <span className="room-status">
          {isOccupied ? 'Reserved' : 'Available'}
        </span>
        <small>
          {isOccupied
            ? `${selectedTime} · ${people} people`
            : `${selectedTime} · Free`}
        </small>
      </button>
    )
  }

  return (
    <div className="library-module">
      <main className="main-content" id="library">
        <div className="page-heading">
          <div>
            <span className="eyebrow">CAMPUS FACILITIES</span>
            <h2>Library</h2>
            <p>Choose your study seat or group room</p>
          </div>

          <div className="floor-selector">
            <button
              className={selectedFloor === 1 ? 'floor-active' : ''}
              onClick={() => {
                setSelectedFloor(1)
                setSelectedSeat(null)
                setSelectedRoom(null)
              }}
            >
              Floor 1
            </button>

            <button
              className={selectedFloor === 2 ? 'floor-active' : ''}
              onClick={() => {
                setSelectedFloor(2)
                setSelectedSeat(null)
                setSelectedRoom(null)
              }}
            >
              Floor 2
            </button>
          </div>
        </div>

        {selectedFloor === 1 ? (
          <>
            <div className="legend">
              <span><i className="dot available-dot" /> Available</span>
              <span><i className="dot occupied-dot" /> Occupied</span>
              <span><i className="dot on-break-dot" /> On break</span>
              <span><i className="dot selected-dot" /> Selected</span>
            </div>

            <div className="library-map">
              <div className="map-label">LIBRARY FLOOR PLAN</div>

              <div className="library-wings">
                <section className="wing">
                  <h3>LEFT SIDE</h3>
                  <div className="table-grid">
                    {Array.from({ length: 6 }, (_, i) =>
                      renderTable(i + 1)
                    )}
                  </div>
                </section>

                <div className="central-aisle">
                  <span>WALKWAY</span>
                </div>

                <section className="wing">
                  <h3>RIGHT SIDE</h3>
                  <div className="table-grid">
                    {Array.from({ length: 6 }, (_, i) =>
                      renderTable(i + 7)
                    )}
                  </div>
                </section>
              </div>

              <div className="map-footer">
                MAIN LIBRARY · FLOOR 1
              </div>
            </div>

            <section className="group-rooms-section">
              <div className="rooms-heading">
                <div>
                  <span className="eyebrow">GROUP STUDY AREA</span>
                  <h2>Group Study Rooms</h2>
                  <p>Two separate rooms · Maximum 6 people per room</p>
                </div>

                <div className="time-selector">
                  <label htmlFor="room-time">Select time</label>
                  <select
                    id="room-time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value)
                      setSelectedRoom(null)
                    }}
                  >
                    <option value="14:00">14:00 - 15:00</option>
                    <option value="15:00">15:00 - 16:00</option>
                    <option value="16:00">16:00 - 17:00</option>
                  </select>
                </div>
              </div>

              <div className="group-rooms">
                {renderRoom(1)}
                <div className="room-distance">
                  <span>100 m</span>
                  <small>Walkway</small>
                </div>
                {renderRoom(2)}
              </div>
            </section>

            <div className="selection-panel reservation-container">
              <div className="reservation-progress">
                {['Seat', 'Time', 'Confirm', 'QR Code', 'Complete'].map(
                  (step, index) => (
                    <div
                      key={step}
                      className={`progress-step ${
                        reservationStep >= index + 1
                          ? 'step-active' : ''
                      }`}
                    >
                      <span>{index + 1}</span>
                      <small>{step}</small>
                    </div>
                  )
                )}
              </div>

              {reservationStep === 1 && (
                <div className="reservation-content">
                  <h3>Seat Selection</h3>

                  {selectedSeat ? (
                    <>
                      <p>Selected seat: <strong>{selectedSeat}</strong></p>
                      <p>Reservation date: {today}</p>
                      <button
                        className="reserve-button"
                        onClick={() => setReservationStep(2)}
                      >
                        Continue
                      </button>
                    </>
                  ) : (
                    <p>Please select an available seat from the library map.</p>
                  )}
                </div>
              )}

              {reservationStep === 2 && (
                <div className="reservation-content">
                  <h3>Select Date &amp; Time</h3>
                  <p>Seat: {selectedSeat}</p>
                  <p>Date: {today}</p>

                  <div className="reservation-times">
                    <div>
                      <label>Start time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <label>End time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="reserve-button"
                    onClick={() => {
                      if (startTime >= endTime) {
                        alert('End time must be after start time.')
                        return
                      }

                      if (
                        hasReservationConflict(
                          selectedSeat,
                          startTime,
                          endTime
                        )
                      ) {
                        alert('This seat is already reserved during this time.')
                        return
                      }

                      setReservationStep(3)
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {reservationStep === 3 && (
                <div className="reservation-content">
                  <h3>Confirm Reservation</h3>

                  <div className="reservation-summary">
                    <p>Seat: {selectedSeat}</p>
                    <p>Date: {today}</p>
                    <p>Time: {startTime} - {endTime}</p>
                  </div>

                  <button
                    className="reserve-button"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `${API_URL}/reservations`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              seatId: selectedSeat,
                              date: today,
                              startTime,
                              endTime
                            })
                          }
                        )

                        const data = await response.json()

                        if (!response.ok || !data.success) {
                          alert(data.message || 'Reservation failed!')
                          return
                        }

                        setReservationId(data.reservation.id)
                        setReservationStep(4)
                        await fetchReservations()
                      } catch (error) {
                        console.error('Reservation error:', error)
                        alert('Server connection failed!')
                      }
                    }}
                  >
                    Confirm &amp; Continue
                  </button>
                </div>
              )}

              {reservationStep === 4 && (
                <div className="reservation-content">
                  <h3>QR Code Verification</h3>
                  <p>Please scan the fixed QR code in the library.</p>
                  <div id="qr-reader"></div>
                </div>
              )}

              {reservationStep === 5 && (
                <div className="reservation-content">
                  <h3>Reservation Completed</h3>
                  <div className="success-icon">✓</div>
                  <h2>Confirmed</h2>
                  <p>Your seat has been successfully reserved.</p>

                  <div className="reservation-summary">
                    <p>Seat: {selectedSeat}</p>
                    <p>Date: {today}</p>
                    <p>Time: {startTime} - {endTime}</p>
                  </div>

                  <button
                    className="reserve-button"
                    onClick={() => {
                      setSelectedSeat(null)
                      setReservationId(null)
                      setStartTime('10:00')
                      setEndTime('12:00')
                      setReservationStep(1)
                    }}
                  >
                    New Reservation
                  </button>
                </div>
              )}
            </div>

            <div className="selection-panel">
              <div>
                <h3>Active Reservations (Transaction via QR)</h3>

                {reservations.length === 0 ? (
                  <p>No active reservations.</p>
                ) : (
                  reservations.map((r) => (
                    <p key={r.id}>
                      {r.seatId} · {r.startTime} - {r.endTime}
                      {r.onBreak
                        ? ` · On break (${formatRemaining(r.breakEndsAt)} left)`
                        : ''}{' '}

                      {!r.onBreak && (
                        <select
                          value={breakMinutes}
                          onChange={(e) =>
                            setBreakMinutes(Number(e.target.value))
                          }
                        >
                          {BREAK_OPTIONS.map((minutes) => (
                            <option key={minutes} value={minutes}>
                              {minutes} min
                            </option>
                          ))}
                        </select>
                      )}{' '}

                      <button
                        className="reserve-button"
                        onClick={() => toggleBreak(r.id, r.onBreak)}
                      >
                        {r.onBreak ? 'End the break' : 'Give break'}
                      </button>{' '}

                      <button
                        className="reserve-button"
                        onClick={() => checkOut(r.id)}
                      >
                        Exit
                      </button>
                    </p>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="coming-soon">
            <h2>Floor 2</h2>
            <p>Upper gallery layout will be added soon.</p>
            <span>Open central area · Perimeter seating</span>
          </div>
        )}
      </main>
    </div>
  )
}
