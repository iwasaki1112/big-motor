'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect } from "react"
import { set } from '@/redux/features/scoreSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'

type Player = {
  x: number,
  y: number,
  width: number,
  height: number
}

type Bullet = {
  x: number,
  y: number,
  width: number,
  height: number
}

type Enemy = {
  x: number,
  y: number,
  width: number,
  height: number
}

type GameState = {
  player: Player,
  bullets: Bullet[],
  enemies: Enemy[],
  score: number
}

const CANVAS_WIDTH = 375
const CANVAS_HEIGHT = 667
const MOVING_DISTANCE = 10
const ENEMY_SIZE = {
  WIDTH: 60,
  HEIGHT: 122
}
const PLAYER_SIZE = {
  WIDTH: 60,
  HEIGHT: 209
}
const BULLET_SIZE = {
  WIDTH: 20,
  HEIGHT: 20
}

let moveDirection = null;
let moveInterval = null;
const MOVE_INTERVAL_MS = 50; // この間隔で移動を継続します


const Game = () => {
  const router = useRouter()
  const canvasRef = useRef(null)
  const dispatch = useDispatch<AppDispatch>()  
  const playerImageRef = useRef(new Image())
  const bulletImageRef = useRef(new Image())
  const enemyImageRef = useRef(new Image())
  const gameStateRef = useRef<GameState>({
    player: { x: (CANVAS_WIDTH / 2) - (30 / 2), y: CANVAS_HEIGHT - 120, width: PLAYER_SIZE.WIDTH, height: PLAYER_SIZE.HEIGHT },
    bullets: [],
    enemies: [],
    score: 0
  })

  const updateGame = () => {
    let newBullets: Bullet[] = gameStateRef.current.bullets
      .map(bullet => ({ ...bullet, y: bullet.y - 5 }))
      .filter(bullet => bullet.y > 0);

    const newEnemies: Enemy[] = gameStateRef.current.enemies
      .map(enemy => ({ ...enemy, y: enemy.y + 5 }))
      .filter(enemy => enemy.y < CANVAS_HEIGHT)

    if (Math.random() < 0.1) {
      newEnemies.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 0,
        width: ENEMY_SIZE.WIDTH,
        height: ENEMY_SIZE.HEIGHT
      })
    }

    const hitBullets: Bullet[] = []
    for (let bullet of newBullets) {
      for (let i = 0; i < newEnemies.length; i++) {
        if (detectBulletCollision(bullet, newEnemies, i)) {
          newEnemies.splice(i, 1)
          hitBullets.push(bullet)
          gameStateRef.current.score += 1
          break
        }
      }
    }

    for (let enemy of newEnemies) {
      if (detectEnemyCollision(enemy)) {
        router.push("/score")
        dispatch(set(gameStateRef.current.score))
        return
      }
    }

    newBullets = newBullets.filter(bullet => !hitBullets.includes(bullet))

    gameStateRef.current.bullets = newBullets
    gameStateRef.current.enemies = newEnemies

    draw()
    requestAnimationFrame(updateGame)
  }

  const draw = () => {
    const canvas: any = canvasRef.current
    const ctx = canvas!.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // プレイヤー作成
    createPlayer(ctx, gameStateRef.current.player)
    // 球の作成
    for (let bullet of gameStateRef.current.bullets) {
      createBullet(ctx, bullet)
    }
    // 敵の作成
    for (let enemy of gameStateRef.current.enemies) {
      createEnemy(ctx, enemy)
    }
    // スコアボードの作成      
    createScoreBoard(ctx, gameStateRef.current.score)
  }

  /**
   * 球がプレイヤーに当たったかどうかを判定する
   * 当たった場合はtrueを返します
   * 
   * @param enemy 
   * @returns boolean
   */
  const detectEnemyCollision = (enemy: Enemy): boolean => {
    return enemy.y + enemy.height > gameStateRef.current.player.y &&
      enemy.y < gameStateRef.current.player.y + gameStateRef.current.player.height &&
      enemy.x + enemy.width > gameStateRef.current.player.x &&
      enemy.x < gameStateRef.current.player.x + gameStateRef.current.player.width
  }

  /**
   * 球が敵に当たったかどうかを判定する
   * 当たった場合はtrueを返します
   * 
   * @param bullet 
   * @param newEnemies 
   * @param i 
   * @returns boolean
   */
  const detectBulletCollision = (bullet: Bullet, newEnemies: Enemy[], i: number): boolean => {
    return bullet.x < newEnemies[i].x + newEnemies[i].width &&
      bullet.x + bullet.width > newEnemies[i].x &&
      bullet.y < newEnemies[i].y + newEnemies[i].height &&
      bullet.y + bullet.height > newEnemies[i].y
  }

  const handleKeyDown = (e: any): void => {
    if (e.key === "a" && gameStateRef.current.player.x > 0) {
      gameStateRef.current.player.x -= MOVING_DISTANCE
    } else if (e.key === "d" && gameStateRef.current.player.x < CANVAS_WIDTH - gameStateRef.current.player.width) {
      gameStateRef.current.player.x += MOVING_DISTANCE
    }
  }

  const handleClick = (e: any): void => {
    gameStateRef.current.bullets.push({
      x: (gameStateRef.current.player.x + gameStateRef.current.player.width / 2) - 15,
      y: gameStateRef.current.player.y - 20,
      width: BULLET_SIZE.WIDTH,
      height: BULLET_SIZE.HEIGHT
    })
  }

  const createEnemy = (ctx: any, enemy: Enemy): void => {
    ctx.drawImage(
      enemyImageRef.current,
      enemy.x, enemy.y, enemy.width, enemy.height
    )
  }

  const createPlayer = (ctx: any, player: Player): void => {
    ctx.drawImage(
      playerImageRef.current,
      player.x,
      player.y,
      player.width,
      player.height
    )
  }

  const createBullet = (ctx: any, bullet: Bullet): void => {
    ctx.drawImage(
      bulletImageRef.current,
      bullet.x,
      bullet.y,
      bullet.width,
      bullet.height
    )
  }

  const createScoreBoard = (ctx: any, score: number): void => {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText(`${score}車`, 10, 30);
  }

  const loadImage = (imageRef: any, src: string) => {
    return new Promise((resolve) => {
      imageRef.current.src = src
      imageRef.current.onload = resolve
    })
  }

  useEffect(() => {
    Promise.all([
      loadImage(playerImageRef, "/images/player.png"),
      loadImage(bulletImageRef, "/images/bullet.png"),
      loadImage(enemyImageRef, "/images/enemy.png")
    ]).then(() => {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("click", handleClick)
      requestAnimationFrame(updateGame)
    })
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleClick)
    }
  }, [])

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
}

export default Game