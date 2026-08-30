export type Location = {
    id : number;
    name : string;
    country : string;
    latitude : number;
    longitude : number;
    image : string;
    clues : string[];
}

export const locations : Location[] = [
    {
        id : 1,
        name : "Tokyo",
        country : "Japan",
        latitude : 35.6762,
        longitude : 139.6503,
        image : "/locations/tokyo.jpg",
        clues : [
            "You can see Japanese writing.",
            "I love watching anime.",
            "This area is densely built up."
        ]
    },
    {
        id : 2,
        name : "Mumbai",
        country : "India",
        latitude : 19.0760,
        longitude : 72.8777,
        image : "/locations/mumbai.jpg",
        clues : [
            'English appears alongside a local script.',
            "The area is densely populated.",
            "Traffic drives on the left."
        ]
    },
    {
        id : 3,
        name : "Reykjavik",
        country : "Iceland",
        latitude : 64.1466,
        longitude : -21.9426,
        image : "/locations/reykjavik.jpg",
        clues : [
            'The landscape is cold and volcanic.',
            "There is very little dense vegetation.",
            "The architecture has a distinctly Nordic feel.",
        ]
    },
    {
        id : 4,
        name : "Sydney, Australia",
        country : 'Australia',
        latitude : -33.8688,
        longitude : 151.2093,
        image : '/locations/sydney.jpg',
        clues : [
            "Traffic drivesw on the left.",
            "This signs use english.",
            "The climate looks relatively warm.",
        ]
    },
    {
        id : 5,
        name : "Rio de Janeiro",
        latitude : -22.9068,
        longitude : -43.1729,
        country : "Brazil",
        image : "/locations/rio.jpg",
        clues : [
            "Portugese is visible on signs.",
            "The landscape is mountainous.",
            "The climate is tropical."
        ]
    },
    
]