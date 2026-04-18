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
  | 'applause'
  | 'drumroll'
  | 'fail'
  | 'crickets'
  | 'buzzer'
  | 'airhorn'
  | 'clap'

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
      case 'applause':
        await this.playApplause()
        break
      case 'drumroll':
        await this.playDrumroll()
        break
      case 'fail':
        await this.playFail()
        break
      case 'crickets':
        await this.playCrickets()
        break
      case 'buzzer':
        await this.playBuzzer()
        break
      case 'airhorn':
        await this.playAirhorn()
        break
      case 'clap':
        await this.playClap()
        break
    }
  }

  private async playClap() {
    const ctx = this.getContext()
    const duration = 0.12
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1800
    bp.Q.value = 1.2

    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.9, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    noise.connect(bp)
    bp.connect(gain)
    gain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + duration)
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

  // Applause - white-noise burst that swells then fades
  private async playApplause() {
    const ctx = this.getContext()
    const duration = 1.6
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 2200
    bandpass.Q.value = 0.8

    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.6, now + 0.25)
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.35, now + duration - 0.2)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    noise.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + duration)
  }

  // Drumroll - rapid ticks that ends with a thud
  private async playDrumroll() {
    const count = 28
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.playTone(180 + (i % 2) * 30, 0.03, 'square'), i * 35)
    }
    setTimeout(() => this.playTone(90, 0.35, 'triangle'), count * 35 + 60)
  }

  // Fail - sad trombone (descending notes)
  private async playFail() {
    const notes = [392, 370, 349, 330]
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => this.playTone(notes[i], 0.28, 'sawtooth'), i * 180)
    }
  }

  // Crickets - periodic high chirps
  private async playCrickets() {
    const chirpTimes = [0, 250, 500, 900, 1150, 1400]
    chirpTimes.forEach((t) => {
      setTimeout(() => {
        this.playTone(4800, 0.04, 'triangle')
        setTimeout(() => this.playTone(4800, 0.04, 'triangle'), 70)
      }, t)
    })
  }

  // Buzzer - harsh low square wave
  private async playBuzzer() {
    await this.playTone(140, 0.6, 'square')
  }

  // Airhorn - two loud descending blasts
  private async playAirhorn() {
    const ctx = this.getContext()
    const blast = (start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(520, ctx.currentTime + start)
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + start + duration)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(this.volume * 0.7, ctx.currentTime + start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }
    blast(0, 0.4)
    blast(0.5, 0.6)
  }
}

export const soundManager = new SoundManager()
