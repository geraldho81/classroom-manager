type SoundType =
  | 'bell'
  | 'chime'
  | 'alert'
  | 'success'
  | 'tick'
  | 'pop'
  | 'sparkle'
  | 'whoosh'
  | 'click'
  | 'diceRoll'
  | 'coinFlip'
  | 'fanfare'

class SoundManager {
  private audioContext: AudioContext | null = null
  private volume: number = 0.5

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol))
  }

  getVolume(): number {
    return this.volume
  }

  async playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(this.volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  async playSound(soundType: SoundType) {
    switch (soundType) {
      case 'bell':
        await this.playBell()
        break
      case 'chime':
        await this.playChime()
        break
      case 'alert':
        await this.playAlert()
        break
      case 'success':
        await this.playSuccess()
        break
      case 'tick':
        await this.playTick()
        break
      case 'pop':
        await this.playPop()
        break
      case 'sparkle':
        await this.playSparkle()
        break
      case 'whoosh':
        await this.playWhoosh()
        break
      case 'click':
        await this.playClick()
        break
      case 'diceRoll':
        await this.playDiceRoll()
        break
      case 'coinFlip':
        await this.playCoinFlip()
        break
      case 'fanfare':
        await this.playFanfare()
        break
    }
  }

  private async playBell() {
    await this.playTone(830, 0.3, 'sine')
    setTimeout(() => this.playTone(830, 0.5, 'sine'), 150)
  }

  private async playChime() {
    const notes = [523, 659, 784]
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => this.playTone(notes[i], 0.3, 'sine'), i * 150)
    }
  }

  private async playAlert() {
    await this.playTone(440, 0.15, 'square')
    setTimeout(() => this.playTone(440, 0.15, 'square'), 200)
    setTimeout(() => this.playTone(440, 0.15, 'square'), 400)
  }

  private async playSuccess() {
    await this.playTone(523, 0.15, 'sine')
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 100)
    setTimeout(() => this.playTone(784, 0.25, 'sine'), 200)
  }

  private async playTick() {
    await this.playTone(1000, 0.05, 'square')
  }

  private async playPop() {
    await this.playTone(600, 0.06, 'triangle')
  }

  private async playSparkle() {
    const notes = [880, 1174, 1480]
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => this.playTone(notes[i], 0.08, 'sine'), i * 60)
    }
  }

  private async playWhoosh() {
    const ctx = this.getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(260, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25)
    gainNode.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.25)
  }

  private async playClick() {
    await this.playTone(1200, 0.03, 'square')
  }

  // Dice rolling - rattling sound
  private async playDiceRoll() {
    const ctx = this.getContext()
    // Create noise-like rattling
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const freq = 200 + Math.random() * 400
        this.playTone(freq, 0.04, 'square')
      }, i * 40)
    }
    // Final landing thud
    setTimeout(() => this.playTone(150, 0.1, 'triangle'), 350)
  }

  // Coin flip - metallic ping with spin
  private async playCoinFlip() {
    const ctx = this.getContext()
    // Spinning clicks
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(800 + i * 50, 0.02, 'square')
      }, i * 50)
    }
    // Land sound - metallic ring
    setTimeout(() => {
      this.playTone(1200, 0.15, 'sine')
      this.playTone(2400, 0.1, 'sine')
    }, 350)
  }

  // Fanfare for pick me - triumphant sound
  private async playFanfare() {
    const notes = [392, 523, 659, 784] // G, C, E, G (major chord arpeggio)
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => this.playTone(notes[i], 0.2, 'sine'), i * 100)
    }
    // Final sparkle
    setTimeout(() => {
      this.playTone(1047, 0.3, 'sine') // High C
      this.playTone(1319, 0.25, 'sine') // High E
    }, 450)
  }
}

export const soundManager = new SoundManager()
