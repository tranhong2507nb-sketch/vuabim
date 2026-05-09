'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Province, District, Ward } from '@/lib/address/types'

interface Props {
  values: {
    province_code: string
    district_code: string
    ward_code: string
  }
  onChange: (next: {
    province_code: string
    province_name: string
    district_code: string
    district_name: string
    ward_code: string
    ward_name: string
  }) => void
  errors?: {
    province_code?: string
    district_code?: string
    ward_code?: string
  }
}

const API_BASE = 'https://provinces.open-api.vn/api'

/**
 * 3 dropdown phụ thuộc: Tỉnh → Quận → Xã.
 * Dùng API public provinces.open-api.vn (free, không cần auth).
 *
 * Khi chọn cấp cha → reset cấp con + fetch list mới.
 */
export function AddressSelector({ values, onChange, errors }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState({
    provinces: true,
    districts: false,
    wards: false,
  })

  // Load provinces 1 lần
  useEffect(() => {
    fetch(`${API_BASE}/p/`)
      .then(r => r.json())
      .then(data => setProvinces(data ?? []))
      .catch(() => setProvinces([]))
      .finally(() => setLoading(s => ({ ...s, provinces: false })))
  }, [])

  // Khi province đổi → fetch districts
  useEffect(() => {
    if (!values.province_code) {
      setDistricts([])
      return
    }
    setLoading(s => ({ ...s, districts: true }))
    fetch(`${API_BASE}/p/${values.province_code}?depth=2`)
      .then(r => r.json())
      .then(data => setDistricts(data?.districts ?? []))
      .catch(() => setDistricts([]))
      .finally(() => setLoading(s => ({ ...s, districts: false })))
  }, [values.province_code])

  // Khi district đổi → fetch wards
  useEffect(() => {
    if (!values.district_code) {
      setWards([])
      return
    }
    setLoading(s => ({ ...s, wards: true }))
    fetch(`${API_BASE}/d/${values.district_code}?depth=2`)
      .then(r => r.json())
      .then(data => setWards(data?.wards ?? []))
      .catch(() => setWards([]))
      .finally(() => setLoading(s => ({ ...s, wards: false })))
  }, [values.district_code])

  const handleProvince = (code: string) => {
    const p = provinces.find(x => String(x.code) === code)
    onChange({
      province_code: code,
      province_name: p?.name ?? '',
      district_code: '',
      district_name: '',
      ward_code: '',
      ward_name: '',
    })
  }

  const handleDistrict = (code: string) => {
    const d = districts.find(x => String(x.code) === code)
    onChange({
      ...values,
      province_name:
        provinces.find(x => String(x.code) === values.province_code)?.name ?? '',
      district_code: code,
      district_name: d?.name ?? '',
      ward_code: '',
      ward_name: '',
    })
  }

  const handleWard = (code: string) => {
    const w = wards.find(x => String(x.code) === code)
    onChange({
      province_code: values.province_code,
      province_name:
        provinces.find(x => String(x.code) === values.province_code)?.name ?? '',
      district_code: values.district_code,
      district_name:
        districts.find(x => String(x.code) === values.district_code)?.name ?? '',
      ward_code: code,
      ward_name: w?.name ?? '',
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SelectField
        label="Tỉnh / Thành phố"
        value={values.province_code}
        onChange={handleProvince}
        options={provinces}
        loading={loading.provinces}
        placeholder="Chọn Tỉnh/Thành"
        error={errors?.province_code}
      />
      <SelectField
        label="Quận / Huyện"
        value={values.district_code}
        onChange={handleDistrict}
        options={districts}
        loading={loading.districts}
        placeholder={
          !values.province_code ? 'Chọn Tỉnh/TP trước' : 'Chọn Quận/Huyện'
        }
        disabled={!values.province_code}
        error={errors?.district_code}
      />
      <SelectField
        label="Phường / Xã"
        value={values.ward_code}
        onChange={handleWard}
        options={wards}
        loading={loading.wards}
        placeholder={
          !values.district_code ? 'Chọn Quận/Huyện trước' : 'Chọn Phường/Xã'
        }
        disabled={!values.district_code}
        error={errors?.ward_code}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  loading,
  placeholder,
  disabled,
  error,
}: {
  label: string
  value: string
  onChange: (code: string) => void
  options: Array<{ code: string | number; name: string }>
  loading: boolean
  placeholder: string
  disabled?: boolean
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} <span className="text-status-out">*</span>
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || loading}
        className={cn(
          'w-full px-3 py-2.5 min-h-[44px] rounded-lg border bg-card text-foreground appearance-none',
          'border-primary-light',
          'focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20',
          'disabled:bg-section-soft disabled:cursor-not-allowed',
          error && 'border-status-out'
        )}
      >
        <option value="">{loading ? 'Đang tải...' : placeholder}</option>
        {options.map(o => (
          <option key={o.code} value={String(o.code)}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-status-out">{error}</p>}
    </div>
  )
}
