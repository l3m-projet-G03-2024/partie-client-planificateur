
type Feature = {
    geometry: {
        type: string,
        coordinates: [longitude: number, latitude: number]
    },
    properties: {
        country: string,
        country_a: string,
        macroregion: string,
        region: string,
        macrocounty: string,
        county: string,
    }
}


export type GeoPoint = {
    features: Feature[]
}
