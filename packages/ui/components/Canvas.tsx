import { useCallback, useEffect, useRef, VFC } from 'react'

export const Canvas: VFC<{
  width: number
  height: number
}> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { width, height, ...rest } = props

  const draw = useCallback((ctx, frameCount) => {
    console.log('draw')
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
    ctx.fill()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      let frameCount = 0
      let animationFrameId: number

      const render = () => {
        frameCount++
        draw(context, frameCount)
        animationFrameId = window.requestAnimationFrame(render)
      }

      render()

      return () => {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [canvasRef, draw])

  return <canvas className="bg-red-700" ref={canvasRef} width={width} height={height} {...rest} />
}
