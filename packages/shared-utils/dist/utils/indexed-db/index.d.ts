import { Table, TableSchema as ITableSchema } from 'dexie';
import { QueryOption, TableSchema } from './type';
import { Optional } from '../../types/utils';
/**
 * Dexie를 사용한 IndexedDB 프록시 클래스
 */
export declare class IndexedDBProxy {
    private db;
    /**
     * IndexedDBProxy 초기화 생성자
     *
     * 해당 옵션의 데이터베이스 이름으로 데이터베이스 생성
     * @param {string} database 데이터베이스 이름
     */
    constructor(database: string);
    /**
     * 테이블 생성
     * @param {TableSchema} tableSchema 테이블 스키마
     */
    createTable(tableSchema: TableSchema): void;
    /**
     * 생성한 데이터베이스 이름 가져오기
     * @returns {string} 데이터베이스 이름
     */
    getDatabaseName(): string;
    /**
     * 버전 number 가져오기
     * @returns {number} 버전 number
     */
    getVersionNo(): number;
    /**
     * 해당 테이블의 Dexie 객체 가져오기
     * @param {string} tableName 테이블 이름
     * @returns {Table<T,U>} Dexie.Table 객체
     */
    getTable<T, U = number>(tableName: string): Table<T, U>;
    /**
     * 테이블 스키마 가져오기
     * @param {string} tableName 테이블 이름
     * @returns {ITableSchema} Dexie 테이블 스키마
     */
    getTableSchema(tableName: string): ITableSchema;
    /**
     * 테이블 초기화
     * @param {string} tableName 테이블 이름
     */
    clearTable(tableName: string): void;
    /**
     * 테이블 삭제
     * @param {string} tableName 테이블 이름
     */
    dropTable(tableName: string): void;
    /**
     * 테이블 스키마 수정
     * @param {TableSchema} schema 테이블 스키마
     */
    updateTableSchema(schema: TableSchema): void;
    /**
     * 등록된 테이블 전체 이름 리스트 가져오기
     * @returns {Array<string>} 전체 테이블 이름 배열
     */
    getTableList(): Array<string>;
    /**
     * primaryKey 혹은 스키마 값으로 데이터 가져오기
     *
     * 스키마 값으로 검색 시 데이터가 여러개라면 가장 먼저 등록된 데이터 한개만 노출
     * @param {string} tableName 테이블 이름
     * @param {number | QueryOption} option primaryKey 혹은 스키마 값
     * @returns {Promise<Optional<T>>} 객체 또는 undefined
     */
    get<T>(tableName: string, option: number | QueryOption): Promise<Optional<T>>;
    /**
     * liveQuery를 사용하여 자유롭게 쿼리문을 사용 가능
     * @param {string} tableName 테이블 이름
     * @param {(table: Table<T, U>) => Promise<R>} queryCallback 쿼리
     * @returns {Promise<R>} Promise 객체
     */
    liveQuery<T, R = unknown, U = number>(tableName: string, queryCallback: (table: Table<T, U>) => Promise<R>): Promise<R>;
    /**
     * 데이터 추가
     * @param {string} tableName 테이블 이름
     * @param item
     * @returns {Promise<number>} 추가한 데이터의 PrimaryKey
     */
    add<T>(tableName: string, item: T): Promise<number>;
    /**
     * 데이터 수정
     * @param {string} tableName 테이블 이름
     * @param {number} primaryKey 테이블의 primaryKey(unique)
     * @param {T} changeData 수정하고자 하는 데이터 객체
     * @returns {Promise<number>} 총 수정된 데이터의 숫자
     */
    update<T>(tableName: string, primaryKey: number, changeData: T): Promise<number>;
    /**
     * 데이터 삭제
     * @param {string} tableName 테이블 이름
     * @param {number} primaryKey 테이블의 primaryKey(unique)
     * @returns {Promise<void>}
     */
    delete(tableName: string, primaryKey: number): Promise<void>;
    /**
     * 여러개의 primaryKey를 받아 리스트 가져오기
     * @param {string} tableName 테이블 이름
     * @param {number[]} primaryKeys 테이블의 primaryKey(unique) 배열
     * @returns {Promise<Optional<T>[]>} 객체 또는 undefined의 배열
     */
    bulkGet<T>(tableName: string, primaryKeys: number[]): Promise<Optional<T>[]>;
    /**
     * 대량 등록
     * @param {string} tableName 테이블 이름
     * @param {T[]} items 등록하고자 하는 객체 배열
     * @returns {Promise<number>} 마지막으로 등록한 PrimaryKey
     */
    bulkAdd<T>(tableName: string, items: T[]): Promise<number>;
    /**
     * 대량 삭제
     * @param {string} tableName 테이블 이름
     * @param {number[]} primaryKeys 테이블의 primaryKey(unique) 배열
     * @returns {Promise<void>}
     */
    bulkDelete(tableName: string, primaryKeys: number[]): Promise<void>;
    /**
     * 등록된 테이블 스키마 정보와 맞는지 검증
     * @param {string} tableName 테이블 이름
     * @param {T | T[]} checkData 검증할 객체 또는 객체 배열
     */
    private validExistTableSchema;
    /**
     * 테이블이 존재하는지 검증
     * @param {TableSchema} schema 테이블 스키마
     */
    private validExistTable;
}
/**
 * seed-utils IndexedDB
 * @param {string} database 생성하고자 하는 데이터베이스 이름
 * @returns {IndexedDBProxy} 생성된 IndexedDBProxy 객체
 */
export declare const useIndexedDB: (database: string) => IndexedDBProxy;
