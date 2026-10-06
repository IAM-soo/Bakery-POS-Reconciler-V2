export const POS_METHODS = [
  "クレジットカード",
  "交通系IC",
  "JREポイント",
  "国内QR",
  "中国QR",
  "電子マネー",
] as const

export const CAT_PAYMENT_GROUPS = {
  クレジットカード: ["クレジットカード"],
  交通系IC: ["交通系IC"],
  JREポイント: ["JREポイント"],
  国内QR: [
    "d払い",
    "PayPay",
    "au PAY",
    "楽天ペイ",
    "J-Coin Pay",
    "teppay",
  ],
  中国QR: ["Alipay", "WeChatPay"],
  電子マネー: ["楽天Edy", "iD", "QUICPay", "WAON", "nanaco"],
} as const