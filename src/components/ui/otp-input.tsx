'use client'

import * as React from 'react'

type OTPInputContextType = {
  slots: {
    char: string
    hasFakeCaret: boolean
    isActive: boolean
  }[]
}

export const OTPInputContext = React.createContext<OTPInputContextType>({
  slots: [],
})

type OTPInputProps = {
  length?: number
  onChange: (value: string) => void
  className?: string                // ✅ أضف هذا
  containerClassName?: string      // ✅ وأضف هذا أيضًا
}


export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ length = 6, onChange, className, containerClassName }, ref) => {

  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(''))
  const [activeIndex, setActiveIndex] = React.useState(0)

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    onChange(newOtp.join(''))

    if (value && index + 1 < length) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
      setActiveIndex(index + 1)
    }
  }

  const slots = otp.map((char, index) => ({
    char,
    hasFakeCaret: index === activeIndex,
    isActive: index === activeIndex,
  }))

  return (
    <OTPInputContext.Provider value={{ slots }}>
      <div 
        ref={ref} // ✅ تطبيق الـ ref هنا
        className="flex gap-2 justify-center">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="w-10 h-10 text-center border rounded bg-gray-800 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-gold"
            value={digit}
            onFocus={() => setActiveIndex(i)}
            onChange={(e) => handleChange(e.target.value, i)}
          />
        ))}
      </div>
    </OTPInputContext.Provider>
  )
})
