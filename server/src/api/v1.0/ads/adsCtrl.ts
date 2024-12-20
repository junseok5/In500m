import { NextFunction, Request, Response } from "express"
import Joi from "joi"
import { Between, getRepository, LessThan, MoreThan } from "typeorm"
import Advertisement from "../../../entities/Advertisement"
import Store from "../../../entities/Store"

export const read = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)

    try {
        const advertisement = await Advertisement.findOne({ id })

        if (!advertisement) {
            return res.status(404).send("광고가 존재하지 않습니다.")
        }

        return res.json(advertisement)
    } catch (e) {
        console.error(e)
        return next(e)
    }
}

export const list = async (req: Request, res: Response, next: NextFunction) => {
    const category = req.query.category ? Number(req.query.category) : undefined
    let lat = Number(req.query.lat)
    let lng = Number(req.query.lng)
    const radius = Number(req.query.radius)
    const storeId = req.query.storeId
    let latRadius
    let lngRadius

    if (radius) {
        latRadius = radius * 0.0000075
        lngRadius = radius * 0.000009
    }

    try {
        if (storeId) {
            const store = await Store.findOne({ id: storeId })

            if (store) {
                lat = store.lat
                lng = store.lng
            }
        }

        let query
        query =
            category !== undefined
                ? {
                      category
                  }
                : {}
        query = radius
            ? {
                  ...query,
                  lat: Between(lat - latRadius, lat + latRadius),
                  lng: Between(lng - lngRadius, lng + lngRadius)
              }
            : { ...query }

        let now = new Date().toISOString().split("T")[0]
        now = `${now}T00:00:00`

        query = {
            ...query,
            startAt: LessThan(now),
            endAt: MoreThan(now),
            isStopped: false
        }

        const advertisements = await getRepository(Advertisement).find(query)
        return res.json(advertisements)
    } catch (e) {
        console.error(e)
        return next(e)
    }
}

export const write = async (req, res: Response, next: NextFunction) => {
    const ad = req.body
    const photo = req.file
    const storeId = req.params.id
    const owner = req.owner

    try {
        const store = await Store.findOne(
            { id: storeId },
            { relations: ["owner", "verificationStore"] }
        )

        if (!store) {
            return res.status(404).send("가맹점이 존재하지 않습니다.")
        }

        if (store.owner.id !== owner.id) {
            return res.status(401).send("해당 가맹점의 점주 계정이 아닙니다.")
        }

        if (!store.verificationStore) {
            return res.status(404).send("가맹점 인증 정보가 존재하지 않습니다.")
        }

        if (store.verificationStore.status !== "ACCEPTED") {
            return res.status(401).json("사업자 인증을 먼저 진행해주세요.")
        }

        const schema = Joi.object().keys({
            title: Joi.string().required(),
            description: Joi.string(),
            startAt: Joi.date().required(),
            endAt: Joi.date().required(),
            adType: Joi.string().required()
        })

        const validation = Joi.validate(ad, schema)

        if (validation.error) {
            console.error(validation.error)
            return res.status(400).send("유효하지 않은 입력 값이 존재합니다.")
        }

        if (photo) {
            ad.photo = `/${photo.filename}`
        }

        const savedAdvertisement = await Advertisement.create({
            ...ad,
            category: store.category,
            lat: store.lat,
            lng: store.lng,
            store
        }).save()

        return res.json(savedAdvertisement)
    } catch (e) {
        console.error(e)
        return next(e)
    }
}

export const update = async (req, res: Response, next: NextFunction) => {
    const id = req.params.id
    const owner = req.owner
    const photo = req.file

    try {
        const advertisement = await Advertisement.findOne(
            { id },
            { relations: ["store", "store.owner"] }
        )

        if (!advertisement) {
            return res.status(404).json("해당 id의 광고가 존재하지 않습니다.")
        }

        if (!advertisement.store) {
            return res
                .status(404)
                .send("광고를 등록한 가맹점 정보가 존재하지 않습니다.")
        }

        if (advertisement.store.owner.id !== owner.id) {
            return res.status(401).send("광고를 등록한 점주가 아닙니다.")
        }

        const schema = Joi.object().keys({
            title: Joi.string(),
            description: Joi.string(),
            startAt: Joi.date(),
            endAt: Joi.date(),
            adType: Joi.string(),
            isStopped: Joi.boolean()
        })

        const validation = Joi.validate(req.body, schema)
        if (validation.error) {
            return res.status(400).send("유효하지 않은 입력 값이 존재합니다.")
        }

        if (photo) {
            req.body.photo = `/${photo.filename}`
        }

        await Advertisement.update(
            { id },
            {
                ...req.body
            }
        )

        return res.send("업데이트에 성공하였습니다.")
    } catch (e) {
        return next(e)
    }
}

export const remove = async (req, res: Response, next: NextFunction) => {
    const owner = req.owner
    const id = req.params.id

    try {
        const advertisement = await Advertisement.findOne(
            { id },
            { relations: ["store", "store.owner"] }
        )

        if (!advertisement) {
            return res.status(404).send("해당 id의 광고가 존재하지 않습니다.")
        }

        if (!advertisement.store) {
            return res
                .status(404)
                .send("광고를 등록한 가맹점이 존재하지 않습니다.")
        }

        if (advertisement.store.owner.id !== owner.id) {
            return res.status(401).send("광고를 등록한 점주가 아닙니다.")
        }

        await advertisement.remove()

        return res.send("삭제에 성공하였습니다.")
    } catch (e) {
        return next(e)
    }
}
