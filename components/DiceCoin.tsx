'use client'

import { useState, useCallback } from 'react'
import { Dices, Coins, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, getRandomInt } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

const diceValues: Record<number, string[][]> = {
  1: [['', '', ''], ['', '●', ''], ['', '', '']],
  2: [['●', '', ''], ['', '', ''], ['', '', '●']],
  3: [['●', '', ''], ['', '●', ''], ['', '', '●']],
  4: [['●', '', '●'], ['', '', ''], ['●', '', '●']],
  5: [['●', '', '●'], ['', '●', ''], ['●', '', '●']],
  6: [['●', '', '●'], ['●', '', '●'], ['●', '', '●']],
}

export function DiceCoin() {
  const { soundEnabled } = useSettingsStore()

  // Dice state
  const [diceCount, setDiceCount] = useState(1)
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [isRollingDice, setIsRollingDice] = useState(false)

  // Coin state
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
  const [isFlippingCoin, setIsFlippingCoin] = useState(false)

  // History
  const [diceHistory, setDiceHistory] = useState<number[][]>([])
  const [coinHistory, setCoinHistory] = useState<('heads' | 'tails')[]>([])

  const rollDice = useCallback(() => {
    setIsRollingDice(true)
    if (soundEnabled) {
      soundManager.playSound('diceRoll')
    }

    // Animate through random values
    let animCount = 0
    const animInterval = setInterval(() => {
      const tempResults = Array.from({ length: diceCount }, () =>
        getRandomInt(1, 6)
      )
      setDiceResults(tempResults)
      animCount++

      if (animCount >= 10) {
        clearInterval(animInterval)
        const finalResults = Array.from({ length: diceCount }, () =>
          getRandomInt(1, 6)
        )
        setDiceResults(finalResults)
        setDiceHistory((prev) => [finalResults, ...prev.slice(0, 9)])
        setIsRollingDice(false)
        if (soundEnabled) {
          soundManager.playSound('diceRoll')
        }
      }
    }, 80)
  }, [diceCount, soundEnabled])

  const flipCoin = useCallback(() => {
    setIsFlippingCoin(true)
    if (soundEnabled) {
      soundManager.playSound('coinFlip')
    }

    // Animate coin flip
    let flipCount = 0
    const flipInterval = setInterval(() => {
      setCoinResult(flipCount % 2 === 0 ? 'heads' : 'tails')
      flipCount++

      if (flipCount >= 12) {
        clearInterval(flipInterval)
        const final = Math.random() < 0.5 ? 'heads' : 'tails'
        setCoinResult(final)
        setCoinHistory((prev) => [final, ...prev.slice(0, 9)])
        setIsFlippingCoin(false)
        if (soundEnabled) {
          soundManager.playSound('coinFlip')
        }
      }
    }, 100)
  }, [soundEnabled])

  const clearDiceHistory = () => {
    setDiceHistory([])
    setDiceResults([])
    if (soundEnabled) {
      soundManager.playSound('click')
    }
  }

  const clearCoinHistory = () => {
    setCoinHistory([])
    setCoinResult(null)
    if (soundEnabled) {
      soundManager.playSound('click')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-stretch">
      {/* Dice Section */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Dices className="h-5 w-5" />
              Dice Roller
            </CardTitle>
            {diceHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearDiceHistory}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            {/* Dice Display */}
            <div className="flex flex-wrap justify-center gap-4 mb-6 min-h-[120px] items-center">
              {diceResults.length > 0 ? (
                diceResults.map((value, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-20 h-20 bg-white border-2 border-foreground/20 rounded-xl shadow-md',
                      'grid grid-cols-3 gap-1 p-2',
                      isRollingDice && 'animate-shake'
                    )}
                  >
                    {diceValues[value].map((row, rowIdx) =>
                      row.map((cell, cellIdx) => (
                        <div
                          key={`${rowIdx}-${cellIdx}`}
                          className="flex items-center justify-center"
                        >
                          {cell && (
                            <div className="w-3 h-3 bg-foreground rounded-full" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">Click Roll to start</div>
              )}
            </div>

            {/* Total */}
            {diceResults.length > 1 && (
              <div className="text-center mb-4">
                <span className="text-muted-foreground">Total: </span>
                <span className="text-2xl font-bold">
                  {diceResults.reduce((a, b) => a + b, 0)}
                </span>
              </div>
            )}

            {/* Dice Count Selector */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Number of dice:</span>
              {[1, 2, 3, 4].map((count) => (
                <Button
                  key={count}
                  variant={diceCount === count ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDiceCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Roll Button */}
          <Button
            size="lg"
            onClick={rollDice}
            disabled={isRollingDice}
            className="w-full"
          >
            <Dices className={cn('mr-2 h-5 w-5', isRollingDice && 'animate-spin')} />
            {isRollingDice ? 'Rolling...' : 'Roll Dice'}
          </Button>

          {/* History */}
          {diceHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Recent rolls:</p>
              <div className="flex flex-wrap gap-2">
                {diceHistory.slice(0, 5).map((roll, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-secondary rounded text-sm"
                  >
                    [{roll.join(', ')}]{roll.length > 1 && ` = ${roll.reduce((a, b) => a + b, 0)}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coin Section */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Coin Flip
            </CardTitle>
            {coinHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCoinHistory}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            {/* Coin Display */}
            <div className="flex justify-center mb-6 min-h-[120px] items-center">
              {coinResult ? (
                <div
                  className={cn(
                    'w-28 h-28 rounded-full flex items-center justify-center border-4 shadow-lg',
                    coinResult === 'heads'
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-600'
                      : 'bg-gradient-to-br from-slate-300 to-slate-400 border-slate-500',
                    isFlippingCoin && 'animate-flip'
                  )}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                >
                  <span className="text-4xl">
                    {coinResult === 'heads' ? '👑' : '🐉'}
                  </span>
                </div>
              ) : (
                <div className="text-muted-foreground">Click Flip to start</div>
              )}
            </div>

            {/* Result Text */}
            {coinResult && !isFlippingCoin && (
              <div className="text-center mb-6">
                <span className="text-2xl font-bold capitalize">{coinResult}</span>
              </div>
            )}
          </div>

          {/* Flip Button */}
          <Button
            size="lg"
            onClick={flipCoin}
            disabled={isFlippingCoin}
            className="w-full"
          >
            <Coins
              className={cn('mr-2 h-5 w-5', isFlippingCoin && 'animate-spin')}
            />
            {isFlippingCoin ? 'Flipping...' : 'Flip Coin'}
          </Button>

          {/* History */}
          {coinHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Recent flips:</p>
              <div className="flex flex-wrap gap-2">
                {coinHistory.slice(0, 10).map((result, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-lg',
                      result === 'heads'
                        ? 'bg-amber-100'
                        : 'bg-slate-100'
                    )}
                  >
                    {result === 'heads' ? '👑' : '🐉'}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                👑 {coinHistory.filter((r) => r === 'heads').length} |
                🐉 {coinHistory.filter((r) => r === 'tails').length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
