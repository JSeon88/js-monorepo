/** param용 테이블 스키마 */
export type TableSchema = {
    [tableName: string]: string | null;
};
/** 데이터 가져오기(get) param용 option */
export type QueryOption = {
    [key: string]: unknown;
};
