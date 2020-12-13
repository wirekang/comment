function getByte(str:string):number {
  return str
    .split('')
    .map((s) => s.charCodeAt(0))
    .reduce((prev, c) => (
      // eslint-disable-next-line no-nested-ternary, no-bitwise
      prev + ((c === 10) ? 2 : ((c >> 7) ? 2 : 1))), 0); // 계산식에 관한 설명은 위 블로그에 있습니다.
}

export default class Filter {
  private ips:Map<string, number>;

  ipLife = 10000;

  ipMax = 1;

  nameMin = 4;

  nameMax = 20;

  textMin = 10;

  textMax = 500;

  constructor() {
    this.ips = new Map<string, number>();
  }

  checkIP(ip:string):boolean {
    const count = this.ips.get(ip);
    if (count) {
      if (count < this.ipMax) {
        this.ips.set(ip, count + 1);
        setTimeout(() => {
          this.ips.set(ip, count);
        }, this.ipLife);
        return true;
      }
      console.log(`IP ${ip}`);
      return false;
    }
    this.ips.set(ip, 1);
    return true;
  }

  filterName(name: string): string {
    if (getByte(name) < this.nameMin) {
      return '익명';
    }
    if (getByte(name) > this.nameMax) {
      return name.substring(0, this.nameMax);
    }
    return name;
  }

  checkText(text: string): boolean {
    return (getByte(text) > this.textMin) && (getByte(text) < this.textMax);
  }
}
