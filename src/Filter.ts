function getByte(str:string):number {
  return str
    .split('')
    .map((s) => s.charCodeAt(0))
    .reduce((prev, c) => (
      // eslint-disable-next-line no-nested-ternary, no-bitwise
      prev + ((c === 10) ? 2 : ((c >> 7) ? 2 : 1))), 0); // 계산식에 관한 설명은 위 블로그에 있습니다.
}

export default class Filter {
  private ips:Map<string, boolean>;

  ipDelay = 10000;

  nameMin = 4;

  nameMax = 20;

  textMin = 10;

  textMax = 500;

  constructor() {
    this.ips = new Map<string, boolean>();
  }

  checkIP(ip:string):boolean {
    const recent = this.ips.get(ip);
    if (recent) {
      console.log(`IP ${ip}`);
      return false;
    }
    this.ips.set(ip, true);
    setTimeout(() => {
      this.ips.set(ip, false);
    }, this.ipDelay);
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
