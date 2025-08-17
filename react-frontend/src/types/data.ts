export interface ApiResonseDataType {
    filtered_weat_data: WeatDataType;
    umap_result: UMAPDataType;
}

export interface WeatDataType {
    [model: string]: {
        [XYAB : string]: number;
    }
}

export interface UMAPDataType {
    [model: string]: [number, number]
}