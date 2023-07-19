import Dexie, {BulkError, Table, TableSchema as ITableSchema} from 'dexie';

import {QueryOption, TableSchema} from './type';

import {Optional} from '@/types/utils';

/**
 * Dexie를 사용한 IndexedDB 프록시 클래스
 */
export class IndexedDBProxy {
    private db: Dexie;
    /**
     * IndexedDBProxy 초기화 생성자
     *
     * 해당 옵션의 데이터베이스 이름으로 데이터베이스 생성
     * @param {string} database 데이터베이스 이름
     */
    constructor(database: string) {
        this.db = new Dexie(database);
    }

    /**
     * 테이블 생성
     * @param {TableSchema} tableSchema 테이블 스키마
     */
    createTable(tableSchema: TableSchema): void {
        this.db.version(this.getVersionNo() || 1).stores(tableSchema);
    }

    /**
     * 생성한 데이터베이스 이름 가져오기
     * @returns {string} 데이터베이스 이름
     */
    getDatabaseName(): string {
        return this.db.name;
    }

    /**
     * 버전 number 가져오기
     * @returns {number} 버전 number
     */
    getVersionNo(): number {
        return this.db.verno;
    }

    /**
     * 해당 테이블의 Dexie 객체 가져오기
     * @param {string} tableName 테이블 이름
     * @returns {Table<T,U>} Dexie.Table 객체
     */
    getTable<T, U = number>(tableName: string): Table<T, U> {
        try {
            return this.db.table<T, U>(tableName);
        } catch (error) {
            throw new Error(`${tableName}은 유효하지 않은 테이블입니다.`);
        }
    }

    /**
     * 테이블 스키마 가져오기
     * @param {string} tableName 테이블 이름
     * @returns {ITableSchema} Dexie 테이블 스키마
     */
    getTableSchema(tableName: string): ITableSchema {
        return this.getTable(tableName).schema;
    }

    /**
     * 테이블 초기화
     * @param {string} tableName 테이블 이름
     */
    clearTable(tableName: string): void {
        this.getTable(tableName).clear();
    }

    /**
     * 테이블 삭제
     * @param {string} tableName 테이블 이름
     */
    dropTable(tableName: string): void {
        try {
            this.getTable(tableName);

            const currentVersion: number = this.getVersionNo();
            this.db.close();
            this.db.version(currentVersion + 1).stores({[tableName]: null});
        } catch (err) {
            throw new Error(`테이블을 삭제하는데 실패하였습니다. ${(err as Error).message}`);
        } finally {
            this.db.open();
        }
    }

    /**
     * 테이블 스키마 수정
     * @param {TableSchema} schema 테이블 스키마
     */
    updateTableSchema(schema: TableSchema): void {
        try {
            this.validExistTable(schema);

            const currentVersion: number = this.getVersionNo();
            this.db.close();
            this.db.version(currentVersion + 1).stores(schema);
        } catch (err) {
            throw new Error(`스키마를 업데이트 하는데 실패하였습니다. ${(err as Error).message}`);
        }
    }

    /**
     * 등록된 테이블 전체 이름 리스트 가져오기
     * @returns {Array<string>} 전체 테이블 이름 배열
     */
    getTableList(): Array<string> {
        return this.db.tables.map((table: Table) => table.name);
    }

    /**
     * primaryKey 혹은 스키마 값으로 데이터 가져오기
     *
     * 스키마 값으로 검색 시 데이터가 여러개라면 가장 먼저 등록된 데이터 한개만 노출
     * @param {string} tableName 테이블 이름
     * @param {number | QueryOption} option primaryKey 혹은 스키마 값
     * @returns {Promise<Optional<T>>} 객체 또는 undefined
     */
    get<T>(tableName: string, option: number | QueryOption): Promise<Optional<T>> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.getTable<T>(tableName).get(option as any);
        } catch (err) {
            throw new Error(`데이터를 가져오는데 실패하였습니다. ${(err as Error).message}`);
        }
    }

    /**
     * liveQuery를 사용하여 자유롭게 쿼리문을 사용 가능
     * @param {string} tableName 테이블 이름
     * @param {(table: Table<T, U>) => Promise<R>} queryCallback 쿼리
     * @returns {Promise<R>} Promise 객체
     */
    liveQuery<T, R = unknown, U = number>(tableName: string, queryCallback: (table: Table<T, U>) => Promise<R>): Promise<R> {
        const table = this.getTable<T, U>(tableName);

        return queryCallback(table);
    }

    /**
     * 데이터 추가
     * @param {string} tableName 테이블 이름
     * @param item
     * @returns {Promise<number>} 추가한 데이터의 PrimaryKey
     */
    add<T>(tableName: string, item: T): Promise<number> {
        this.validExistTableSchema(tableName, item);

        return this.db
            .transaction('rw', this.getTable(tableName), () => {
                return this.getTable<object, number>(tableName).add(item as object);
            })
            .catch((err: Error) => {
                throw new Error(`등록하는데 실패하였습니다. ${err.message}`);
            });
    }

    /**
     * 데이터 수정
     * @param {string} tableName 테이블 이름
     * @param {number} primaryKey 테이블의 primaryKey(unique)
     * @param {T} changeData 수정하고자 하는 데이터 객체
     * @returns {Promise<number>} 총 수정된 데이터의 숫자
     */
    update<T>(tableName: string, primaryKey: number, changeData: T): Promise<number> {
        this.validExistTableSchema(tableName, changeData);

        return this.db.transaction('rw', this.getTable(tableName), () => {
            return this.getTable<object, number>(tableName).update(primaryKey, changeData as object);
        });
    }

    /**
     * 데이터 삭제
     * @param {string} tableName 테이블 이름
     * @param {number} primaryKey 테이블의 primaryKey(unique)
     * @returns {Promise<void>}
     */
    delete(tableName: string, primaryKey: number): Promise<void> {
        return this.db.transaction('rw', this.getTable(tableName), () => {
            return this.getTable(tableName).delete(primaryKey);
        });
    }

    /**
     * 여러개의 primaryKey를 받아 리스트 가져오기
     * @param {string} tableName 테이블 이름
     * @param {number[]} primaryKeys 테이블의 primaryKey(unique) 배열
     * @returns {Promise<Optional<T>[]>} 객체 또는 undefined의 배열
     */
    bulkGet<T>(tableName: string, primaryKeys: number[]): Promise<Optional<T>[]> {
        return this.getTable<T>(tableName).bulkGet(primaryKeys);
    }

    /**
     * 대량 등록
     * @param {string} tableName 테이블 이름
     * @param {T[]} items 등록하고자 하는 객체 배열
     * @returns {Promise<number>} 마지막으로 등록한 PrimaryKey
     */
    bulkAdd<T>(tableName: string, items: T[]): Promise<number> {
        this.validExistTableSchema(tableName, items);

        const lastKey = this.db.transaction('rw', this.getTable(tableName), () => {
            return this.getTable<object, number>(tableName)
                .bulkAdd(items as object[])
                .catch('BulkError', (err: BulkError) => {
                    // primaryKey가 겹치는 경우 BulkError 발생
                    for (const [pos, error] of Object.entries(err.failuresByPos)) {
                        throw new Error(`작업 ${pos} 실패하였고 해당 에러가 발생하였습니다. ${error}`);
                    }
                });
        });
        return lastKey as unknown as Promise<number>;
    }

    /**
     * 대량 삭제
     * @param {string} tableName 테이블 이름
     * @param {number[]} primaryKeys 테이블의 primaryKey(unique) 배열
     * @returns {Promise<void>}
     */
    bulkDelete(tableName: string, primaryKeys: number[]): Promise<void> {
        return this.db.transaction('rw', this.getTable(tableName), () => {
            return this.getTable(tableName).bulkDelete(primaryKeys);
        });
    }

    /**
     * 등록된 테이블 스키마 정보와 맞는지 검증
     * @param {string} tableName 테이블 이름
     * @param {T | T[]} checkData 검증할 객체 또는 객체 배열
     */
    private validExistTableSchema<T>(tableName: string, checkData: T | T[]): void {
        let records: T[];
        if (!Array.isArray(checkData)) {
            records = [checkData];
        } else {
            records = checkData;
        }

        // 필드명 추출
        const schema: ITableSchema = this.getTableSchema(tableName);
        const primKey: string = schema.primKey.name;
        const fieldNames: string[] = Object.keys(schema.idxByName);
        fieldNames.push(primKey);

        // 검증 실행
        for (const record of records) {
            for (const key in record) {
                if (!fieldNames.includes(key)) {
                    throw new Error(`${key}는 유효하지 않은 스키마입니다.`);
                }
            }
        }
    }

    /**
     * 테이블이 존재하는지 검증
     * @param {TableSchema} schema 테이블 스키마
     */
    private validExistTable(schema: TableSchema): void {
        const tableNames = Object.keys(schema);
        for (const tableName of tableNames) {
            this.getTable(tableName);
        }
    }
}

/**
 * seed-utils IndexedDB
 * @param {string} database 생성하고자 하는 데이터베이스 이름
 * @returns {IndexedDBProxy} 생성된 IndexedDBProxy 객체
 */
export const useIndexedDB = (database: string): IndexedDBProxy => {
    return new IndexedDBProxy(database);
};
