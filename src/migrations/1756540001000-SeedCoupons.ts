import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCoupons1756540001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const coupons: any[] = [];

    // 100포인트 쿠폰 7개
    for (let i = 1; i <= 7; i++) {
      coupons.push({
        couponCode: `POINT100-${String(i).padStart(3, '0')}`,
        points: 100,
        isUsed: false,
      });
    }

    // 500포인트 쿠폰 8개
    for (let i = 1; i <= 8; i++) {
      coupons.push({
        couponCode: `POINT500-${String(i).padStart(3, '0')}`,
        points: 500,
        isUsed: false,
      });
    }

    // 1000포인트 쿠폰 5개
    for (let i = 1; i <= 5; i++) {
      coupons.push({
        couponCode: `POINT1000-${String(i).padStart(2, '0')}`,
        points: 1000,
        isUsed: false,
      });
    }

    // 쿠폰 데이터 삽입
    for (const coupon of coupons) {
      await queryRunner.query(
        `INSERT INTO coupons (couponCode, points, isUsed, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())`,
        [coupon.couponCode, coupon.points, coupon.isUsed],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM coupons WHERE couponCode LIKE 'POINT%'`);
  }
}