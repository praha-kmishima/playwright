import { test, expect } from '@playwright/test';

test('会員登録から予約完了までのフローをテスト', async ({ page }) => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testtest',
    name: 'テストユーザー'
  };

  // 会員登録
  await page.goto('https://hotel-example-site.takeyaqa.dev/ja/');
  await page.getByRole('link', { name: '会員登録' }).click();
  await page.getByRole('textbox', { name: 'メールアドレス 必須' }).fill(testUser.email);
  await page.getByRole('textbox', { name: 'パスワード 必須' }).fill(testUser.password);
  await page.getByRole('textbox', { name: 'パスワード（確認） 必須' }).fill(testUser.password);
  await page.getByRole('textbox', { name: '氏名 必須' }).fill(testUser.name);
  await page.getByRole('button', { name: '登録' }).click();

  // 宿泊予約画面への遷移
  await page.getByRole('link', { name: '宿泊予約' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.locator('.card-body > .btn').first().click();
  const reservePage = await page1Promise;

  // 予約情報の入力
  const reservationInfo = {
    stayDays: '2',
    guests: '2',
    plans: ['朝食バイキング', '昼からチェックインプラン', 'お得な観光プラン']
  };

  // 宿泊数の入力
  const stayDaysInput = reservePage.getByRole('spinbutton', { name: '宿泊数 必須' });
  await stayDaysInput.waitFor({ state: 'visible' });
  await stayDaysInput.click();
  await stayDaysInput.clear();
  await stayDaysInput.fill(reservationInfo.stayDays);
  await stayDaysInput.press('Tab'); // 入力の確定

  // 人数の入力
  await reservePage.getByRole('spinbutton', { name: '人数 必須' }).fill(reservationInfo.guests);
  await reservePage.getByRole('spinbutton', { name: '人数 必須' }).press('Tab'); // 入力の確定

  // 確認のご連絡の選択
  await reservePage.getByLabel('確認のご連絡 必須').selectOption('email');
  await reservePage.locator('[data-test="submit-button"]').click();

  // 予約内容確認ページでの検証
  await expect(reservePage.getByRole('heading', { name: '宿泊予約確認' })).toBeVisible();
  
  // 予約者情報の確認
  await expect(reservePage.locator('#username')).toHaveText(`${testUser.name}様`);
  await expect(reservePage.locator('#contact')).toHaveText(`メール：${testUser.email}`);

  // 宿泊情報の確認
  await expect(reservePage.locator('#head-count')).toHaveText(`${reservationInfo.guests}名様`);
  
  // 期間の確認（明日～宿泊終了日）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const expectedDate = `${year}年${Number(month)}月${Number(day)}日`;
  // 宿泊終了日
  // stayDaysの分、日付を加算
  const endDate = new Date(tomorrow);
  endDate.setDate(endDate.getDate() + Number(reservationInfo.stayDays));
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();
  const expectedEndDate = `${endYear}年${endMonth}月${endDay}日`;

  // 宿泊数の確認
  await expect(reservePage.locator('#term')).toHaveText(`${expectedDate} 〜 ${expectedEndDate} ${reservationInfo.stayDays}泊`);

  // 予約の確定
  await reservePage.getByRole('button', { name: 'この内容で予約する' }).click();

  // 予約完了の確認
  await expect(reservePage.getByRole('heading', { name: '予約を完了しました' })).toBeVisible();
  await expect(reservePage.getByText('ご来館、心よりお待ちしております。')).toBeVisible();
});