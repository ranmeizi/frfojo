export enum EnumMsgType {
    MVP击杀信息,
    掉落信息,
    偷窃信息,
    其他
}

// 解析
export type MomoDiscordMsg = {
    ts: number // 时间戳
    key: string // `${ts}_${subject}_${object}`
    subject: string // 谁
    type: EnumMsgType,
    object: string,
    objectId?: string // id
    map?: string // 击杀时有地图
    origin: string
}