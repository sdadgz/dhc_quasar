// 遇到问题睡大觉
export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sub(x: number, y: number) {
  return x - y >= 0 ? x - y : y - x;
}

export function max(num:number,max:number){
  return num > max ? max : num;
}
