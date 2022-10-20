import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-morphing-text',
  templateUrl: './morphing-text.component.html',
  styleUrls: ['./morphing-text.component.scss']
})
export class MorphingTextComponent implements OnInit, AfterViewInit {
  @ViewChild("text1") text1!: ElementRef<HTMLSpanElement>;
  @ViewChild("text2") text2!: ElementRef<HTMLSpanElement>;

  private readonly MORPH_TIME = 1;
  private readonly COOLDOWN_TIME = 0.25;
  private readonly START_TIME = new Date();

  private _cooldown = this.COOLDOWN_TIME;
  private _morph = 0;
  private _referenceTime = new Date();
  private _textIndex = 0;

  private entries = [
    "If",
    "You",
    "Like",
    "It",
    "Please",
    "Give",
    "a Love",
    ":)",
    "by @DotOnion"
  ];

  constructor() { }

  ngAfterViewInit(): void {
    this.updateTextIndex(0);
    
    
    this.animate();
  }

  ngOnInit(): void {

  }

  private doMorph() {
    this._morph -= this._cooldown;
    this._cooldown = 0;

    let fraction = this._morph / this.MORPH_TIME;
    if (fraction > 1) {
      this._cooldown = this.COOLDOWN_TIME;
      fraction = 1;
    }

    this.setMorph(fraction);
  }

  private setMorph(fraction: number) {
    this.text2.nativeElement.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    this.text2.nativeElement.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    this.text1.nativeElement.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    this.text1.nativeElement.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    this.updateTextIndex(this._textIndex);
  }

  private updateTextIndex(index: number) {
    this.text1.nativeElement.textContent = this.entries[this._textIndex % this.entries.length];
    this.text1.nativeElement.textContent = this.entries[(this._textIndex + 1) % this.entries.length];
  }

  private doCooldown() {
    this._morph = 0;

    this.text2.nativeElement.style.filter = "";
    this.text2.nativeElement.style.opacity = "100%";

    this.text1.nativeElement.style.filter = "";
    this.text1.nativeElement.style.opacity = "0%";
  }

  private animate() {
    requestAnimationFrame(this.animate);

    const shouldIncrementIndex = this._cooldown > 0;
    const newTime = new Date();
    const dt = (new Date().getUTCDate() - this._referenceTime.getUTCDate()) / 1000;
    this._referenceTime = newTime;

    this._cooldown -= dt;

    if (this._cooldown <= 0) {
      if (shouldIncrementIndex) {
        this._textIndex++;
      }

      this.doMorph();
    }
    else {
      this.doCooldown();
    }
  }
}
