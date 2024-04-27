
type Feature = {
    geometry: {
        type: string,
        coordinates: [longitude: number, latitude: number][]
    },
}


export type GeoDirections = {
    features: Feature[]
}
