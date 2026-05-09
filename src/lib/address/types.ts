export interface Province {
  code: string | number
  name: string
}

export interface District extends Province {
  province_code: string | number
}

export interface Ward extends Province {
  district_code: string | number
}

export interface ShippingAddress {
  province_code: string
  province_name: string
  district_code: string
  district_name: string
  ward_code: string
  ward_name: string
}
