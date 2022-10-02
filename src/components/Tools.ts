// 遇到问题睡大觉
export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
