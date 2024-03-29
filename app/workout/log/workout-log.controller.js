import asyncHandler from 'express-async-handler'
import { prisma } from '../../prisma.js'

// @desc    Create workoutLog
// @route   POST /api/workouts/log/:workoutId
// @access  Private

export const createWorkoutLog = asyncHandler(async (req, res) => {
	const workoutId = +req.params.id

	const workout = await prisma.workout.findUnique({
		where: {
			id: +req.params.id
		},
		include: {
			exercises: true
		}
	})

	if (!workout) {
		res.status(404)
		throw new Error('Workout not found')
	}

	const workoutLog = await prisma.workoutLog.create({
		data: {
			user: {
				connect: {
					id: req.user.id
				}
			},
			workout: {
				connect: {
					id: workoutId
				}
			},
			exerciselogs: {
				create: workout.exercises.map(exercise => ({
					user: {
						connect: {
							id: req.user.id
						}
					},
					exercise: {
						connect: {
							id: exercise.id
						}
					},
					times: {
						create: Array.from({ length: exercise.times }, () => ({
							weight: 0,
							repeat: 0
						}))
					}
				}))
			}
		},
        include: {
            exerciselogs: {
                include: {
                    times: true
                }
            }
        }

	})

	res.json(workoutLog)
})
