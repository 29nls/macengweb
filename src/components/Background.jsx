import { useEffect, useRef } from "react"

// Posisi awal tiap blob, sejajar dengan urutan ref di bawah.
const INITIAL_POSITIONS = [
	{ x: -4, y: 0 },
	{ x: -4, y: 0 },
	{ x: 20, y: -8 },
	{ x: 20, y: -8 },
]

const AnimatedBackground = () => {
	const blobRefs = useRef([])

	useEffect(() => {
		// requestId null = tidak ada frame yang dijadwalkan. Nilai ini harus
		// dikembalikan ke null di dalam callback, dan TIDAK boleh memanggil
		// requestAnimationFrame(handleScroll) lagi — itulah bug lamanya:
		// loop yang menjadwalkan dirinya sendiri tanpa henti (60fps seumur hidup).
		let requestId = null

		const applyPositions = () => {
			const newScroll = window.pageYOffset

			blobRefs.current.forEach((blob, index) => {
				const initialPos = INITIAL_POSITIONS[index]
				if (!blob || !initialPos) return

				// Calculating movement in both X and Y direction
				const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340 // Horizontal movement
				const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40 // Vertical movement

				blob.style.transform = `translate(${initialPos.x + xOffset}px, ${initialPos.y + yOffset}px)`
			})
		}

		// Maksimal satu update per frame, dan hanya ketika user scroll.
		const handleScroll = () => {
			if (requestId !== null) return
			requestId = requestAnimationFrame(() => {
				requestId = null
				applyPositions()
			})
		}

		// Transisi disetel sekali di sini, bukan ditulis ulang tiap frame.
		blobRefs.current.forEach((blob) => {
			if (blob) blob.style.transition = "transform 1.4s ease-out"
		})
		applyPositions()

		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => {
			window.removeEventListener("scroll", handleScroll)
			if (requestId !== null) cancelAnimationFrame(requestId)
		}
	}, [])

	return (
		<div className="fixed inset-0 ">
			<div className="absolute inset-0">
				<div
					ref={(ref) => (blobRefs.current[0] = ref)}
					className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
				<div
					ref={(ref) => (blobRefs.current[1] = ref)}
					className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 hidden sm:block"></div>
				<div
					ref={(ref) => (blobRefs.current[2] = ref)}
					className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 md:opacity-20 "></div>
					<div
					ref={(ref) => (blobRefs.current[3] = ref)}
					className="absolute -bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"></div>
			</div>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
		</div>
	)
}

export default AnimatedBackground

