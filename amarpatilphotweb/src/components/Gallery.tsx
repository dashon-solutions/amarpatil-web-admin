import React, { useEffect, useState } from "react";
import { X, ZoomIn, ArrowRight, ArrowLeft, Disc } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { GALLERY_DATA } from "../data";
import { GalleryItem } from "../types";
import { getCategories, getGalleries } from "../utils/api";
import { formatHeading } from "../utils/text";

interface GalleryProps {
  isHomepage?: boolean;
}

const FALLBACK_CATEGORIES = [
    {
        "_id": "6a57b9e1cf32814c3c64e590",
        "name": "Fashion",
        "slug": "fashion",
        "isActive": true,
        "createdAt": "2026-07-15T16:48:33.080Z",
        "updatedAt": "2026-07-15T16:48:33.080Z",
        "__v": 0
    },
    {
        "_id": "6a57b9b2cf32814c3c64e58f",
        "name": "Drone",
        "slug": "drone",
        "isActive": true,
        "createdAt": "2026-07-15T16:47:46.215Z",
        "updatedAt": "2026-07-15T16:47:46.215Z",
        "__v": 0
    },
    {
        "_id": "6a57b9accf32814c3c64e58e",
        "name": "Films",
        "slug": "films",
        "isActive": true,
        "createdAt": "2026-07-15T16:47:40.908Z",
        "updatedAt": "2026-07-15T16:47:40.908Z",
        "__v": 0
    },
    {
        "_id": "6a57b9a4cf32814c3c64e58d",
        "name": "Festivals & Traditions",
        "slug": "festivals-traditions",
        "isActive": true,
        "createdAt": "2026-07-15T16:47:32.590Z",
        "updatedAt": "2026-07-15T16:47:32.590Z",
        "__v": 0
    },
    {
        "_id": "6a57b999cf32814c3c64e58c",
        "name": "Commercial",
        "slug": "commercial",
        "isActive": true,
        "createdAt": "2026-07-15T16:47:21.793Z",
        "updatedAt": "2026-07-15T16:47:21.793Z",
        "__v": 0
    },
    {
        "_id": "6a57b992cf32814c3c64e58b",
        "name": "Events",
        "slug": "events",
        "isActive": true,
        "createdAt": "2026-07-15T16:47:14.560Z",
        "updatedAt": "2026-07-15T16:47:14.560Z",
        "__v": 0
    },
    {
        "_id": "6a57b98ccf32814c3c64e58a",
        "name": "Portraits",
        "slug": "portraits",
        "isActive": true,
        "createdAt": "2026-07-15T16:47:08.746Z",
        "updatedAt": "2026-07-15T16:47:08.746Z",
        "__v": 0
    },
    {
        "_id": "6a57b7f9cf32814c3c64e586",
        "name": "Pre-Weddings",
        "slug": "pre-weddings",
        "isActive": true,
        "createdAt": "2026-07-15T16:40:25.433Z",
        "updatedAt": "2026-07-15T16:40:25.433Z",
        "__v": 0
    },
    {
        "_id": "6a3c12ac57b999849ad1ca52",
        "name": "Engagements",
        "slug": "engagement",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
        "isActive": true,
        "createdAt": "2026-06-24T17:23:56.047Z",
        "updatedAt": "2026-07-15T16:39:51.421Z",
        "__v": 0
    },
    {
        "_id": "6a3c128c57b999849ad1ca51",
        "name": "Weddings",
        "slug": "wedding",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
        "isActive": true,
        "createdAt": "2026-06-24T17:23:24.050Z",
        "updatedAt": "2026-07-15T16:39:38.056Z",
        "__v": 0
    }
];

const FALLBACK_GALLERIES = [
    {
        "_id": "6a3c138557b999849ad1ca67",
        "title": "p&s",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322052/photo_crm/cms/vcxld0zo1lrekwiebfep.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:33.325Z",
        "updatedAt": "2026-06-24T17:27:33.325Z",
        "__v": 0
    },
    {
        "_id": "6a3c138257b999849ad1ca66",
        "title": "monochrome",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322049/photo_crm/cms/unmvn2bduurftf1i4cdx.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:30.107Z",
        "updatedAt": "2026-06-24T17:27:30.107Z",
        "__v": 0
    },
    {
        "_id": "6a3c137e57b999849ad1ca65",
        "title": "125A0491 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322045/photo_crm/cms/qix2ahcqxwezrld2qidm.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:26.431Z",
        "updatedAt": "2026-06-24T17:27:26.431Z",
        "__v": 0
    },
    {
        "_id": "6a3c137957b999849ad1ca64",
        "title": "125A0482",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322040/photo_crm/cms/i6u54utr3usqnjqzb4ic.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:21.610Z",
        "updatedAt": "2026-06-24T17:27:21.610Z",
        "__v": 0
    },
    {
        "_id": "6a3c137157b999849ad1ca63",
        "title": "125A0482 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322032/photo_crm/cms/ulgqquponydf20ba1rh5.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:13.358Z",
        "updatedAt": "2026-06-24T17:27:13.358Z",
        "__v": 0
    },
    {
        "_id": "6a3c136b57b999849ad1ca62",
        "title": "125A0479",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322026/photo_crm/cms/hty6swi1ondn1fghrhe1.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:07.389Z",
        "updatedAt": "2026-06-24T17:27:07.389Z",
        "__v": 0
    },
    {
        "_id": "6a3c136557b999849ad1ca61",
        "title": "125A0444 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322020/photo_crm/cms/bozsijzavojizrnaf4u1.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:27:01.652Z",
        "updatedAt": "2026-06-24T17:27:01.652Z",
        "__v": 0
    },
    {
        "_id": "6a3c136057b999849ad1ca60",
        "title": "125A0442 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322015/photo_crm/cms/h6elfv3ugj3vmqoz48j6.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:56.793Z",
        "updatedAt": "2026-06-24T17:26:56.793Z",
        "__v": 0
    },
    {
        "_id": "6a3c135b57b999849ad1ca5f",
        "title": "5M2A9242 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322010/photo_crm/cms/mcwdvevtzjpj5ppdlevm.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:51.312Z",
        "updatedAt": "2026-06-24T17:26:51.312Z",
        "__v": 0
    },
    {
        "_id": "6a3c135757b999849ad1ca5e",
        "title": "5M2A9201 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322006/photo_crm/cms/ykixys9ajwyutpuc3j8e.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:47.411Z",
        "updatedAt": "2026-06-24T17:26:47.411Z",
        "__v": 0
    },
    {
        "_id": "6a3c135357b999849ad1ca5d",
        "title": "5M2A9179 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782322002/photo_crm/cms/f9u3psj5haujyooo4grr.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:43.811Z",
        "updatedAt": "2026-06-24T17:26:43.811Z",
        "__v": 0
    },
    {
        "_id": "6a3c135057b999849ad1ca5c",
        "title": "5M2A9165 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321999/photo_crm/cms/vuwibvihqyzpdffjfimi.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:40.246Z",
        "updatedAt": "2026-06-24T17:26:40.246Z",
        "__v": 0
    },
    {
        "_id": "6a3c134c57b999849ad1ca5b",
        "title": "5M2A9163 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321995/photo_crm/cms/wrsnksahnv0sxvvefjtj.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:36.637Z",
        "updatedAt": "2026-06-24T17:26:36.637Z",
        "__v": 0
    },
    {
        "_id": "6a3c134957b999849ad1ca5a",
        "title": "5M2A9159 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321992/photo_crm/cms/xbofludg5hwanmnm7vjy.webp",
        "category": {
            "_id": "6a3c128c57b999849ad1ca51",
            "name": "Weddings",
            "slug": "wedding",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321803/photo_crm/cms/qayrk8f5c5mh8iodd1ib.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:24.050Z",
            "updatedAt": "2026-07-15T16:39:38.056Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:26:33.190Z",
        "updatedAt": "2026-06-24T17:26:33.190Z",
        "__v": 0
    },
    {
        "_id": "6a3c12d057b999849ad1ca59",
        "title": "5M2A6682 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321871/photo_crm/cms/ttc3sgjollwbmev03whg.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:32.278Z",
        "updatedAt": "2026-06-24T17:24:32.278Z",
        "__v": 0
    },
    {
        "_id": "6a3c12cd57b999849ad1ca58",
        "title": "5M2A6670 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321868/photo_crm/cms/g26xponyseldbedrbsq7.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:29.075Z",
        "updatedAt": "2026-06-24T17:24:29.075Z",
        "__v": 0
    },
    {
        "_id": "6a3c12c957b999849ad1ca57",
        "title": "5M2A6611 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321864/photo_crm/cms/c7y9t9yqirzmlsavwolz.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:25.525Z",
        "updatedAt": "2026-06-24T17:24:25.525Z",
        "__v": 0
    },
    {
        "_id": "6a3c12c757b999849ad1ca56",
        "title": "5M2A6601",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321862/photo_crm/cms/g81msk7v2jhzaqa11r9d.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:23.395Z",
        "updatedAt": "2026-06-24T17:24:23.395Z",
        "__v": 0
    },
    {
        "_id": "6a3c12c357b999849ad1ca55",
        "title": "5M2A6590 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321858/photo_crm/cms/wsigrwostumjxtzbqg8z.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:19.220Z",
        "updatedAt": "2026-06-24T17:24:19.220Z",
        "__v": 0
    },
    {
        "_id": "6a3c12c157b999849ad1ca54",
        "title": "5M2A6350 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321856/photo_crm/cms/iipbf5fqtisoehv72ygd.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:17.294Z",
        "updatedAt": "2026-06-24T17:24:17.294Z",
        "__v": 0
    },
    {
        "_id": "6a3c12bd57b999849ad1ca53",
        "title": "5M2A6343 copy",
        "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321852/photo_crm/cms/ofohpd6gbzapmcztpjoz.webp",
        "category": {
            "_id": "6a3c12ac57b999849ad1ca52",
            "name": "Engagements",
            "slug": "engagement",
            "image": "https://res.cloudinary.com/dh8rylu0t/image/upload/v1782321834/photo_crm/cms/tzxnzippstujmrikyhbs.webp",
            "isActive": true,
            "createdAt": "2026-06-24T17:23:56.047Z",
            "updatedAt": "2026-07-15T16:39:51.421Z",
            "__v": 0
        },
        "isFeatured": false,
        "isActive": true,
        "createdAt": "2026-06-24T17:24:13.457Z",
        "updatedAt": "2026-06-24T17:24:13.457Z",
        "__v": 0
    }
];

export default function Gallery({ isHomepage = false }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const [dynamicCategories, setDynamicCategories] = useState<string[]>(["All"]);
  const [dynamicGalleries, setDynamicGalleries] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getGalleries()])
      .then(([categoriesRes, galleriesRes]) => {
        let activeCats = categoriesRes.filter((c: any) => c.isActive).map((c: any) => c.name);
        if (activeCats.length === 0) {
          activeCats = FALLBACK_CATEGORIES.filter((c: any) => c.isActive).map((c: any) => c.name);
        }
        setDynamicCategories(["All", ...activeCats]);

        let activeGals = galleriesRes.filter((g: any) => g.isActive);
        if (activeGals.length === 0) {
          activeGals = FALLBACK_GALLERIES.filter((g: any) => g.isActive);
        }
        setDynamicGalleries(activeGals);
      })
      .catch((err) => {
        console.error("Error loading gallery data:", err);
        const activeCats = FALLBACK_CATEGORIES.filter((c: any) => c.isActive).map((c: any) => c.name);
        setDynamicCategories(["All", ...activeCats]);
        const activeGals = FALLBACK_GALLERIES.filter((g: any) => g.isActive);
        setDynamicGalleries(activeGals);
      });
  }, []);

  const mappedItems: GalleryItem[] = dynamicGalleries.map((item: any) => ({
    id: item._id,
    title: item.title || "Untitled",
    category: item.category?.name || "Uncategorized",
    imageUrl: item.image,
    imageAlt: item.title || "Gallery Item",
    year: item.createdAt ? new Date(item.createdAt).getFullYear().toString() : "2026",
    dimensions: item.isFeatured ? "Featured Scale" : "Signature scale",
    location: "Studio location"
  }));

  const itemsList = mappedItems.length > 0 ? mappedItems : GALLERY_DATA;
  const categoriesList = dynamicCategories.length > 1 ? dynamicCategories : ["All", "Architecture", "Haute Couture", "Craftsmanship", "Bespoke Interiors", "Organic Artistry"];

  const filteredItems = selectedCategory === "All"
    ? itemsList
    : itemsList.filter(item => item.category === selectedCategory);

  // Group and limit to 5 per category if on homepage
  let displayItems = filteredItems;
  if (isHomepage) {
    const counts: { [key: string]: number } = {};
    displayItems = filteredItems.filter(item => {
      const cat = item.category || "Uncategorized";
      if (!counts[cat]) counts[cat] = 0;
      if (counts[cat] < 5) {
        counts[cat]++;
        return true;
      }
      return false;
    });
  }

  const openLightbox = (id: string) => {
    const index = displayItems.findIndex(item => item.id === id);
    if (index !== -1) {
      setActiveImageIndex(index);
    }
  };

  const closeLightbox = () => {
    setActiveImageIndex(null);
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % displayItems.length);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + displayItems.length) % displayItems.length);
    }
  };

  const activeImage: GalleryItem | null = activeImageIndex !== null ? displayItems[activeImageIndex] : null;

  return (
    <section id="gallery" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header section with sophisticated typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-gold-warm tracking-[0.3em] text-[10px] uppercase font-bold block">
              PORTFOLIO OF RARIFIED PIECES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-secondary font-black tracking-tight text-navy-dark">
              {formatHeading("Curated Gallery")}
            </h2>
            <div className="h-[1.5px] w-20 bg-gold-warm" />
          </div>

          {/* Luxury Categories Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-3 max-w-2xl">
            {categoriesList.map((category) => (
              <button
                id={`gallery-filter-${category.toLowerCase().replace(" ", "-")}`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-[10px] tracking-widest uppercase font-semibold border transition-all duration-300 rounded-xs ${
                  selectedCategory === category
                    ? "bg-navy-dark border-navy-dark text-white shadow-xs"
                    : "bg-transparent border-navy-dark/15 text-navy-dark/75 hover:border-gold-warm hover:text-gold-warm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Collage Grid (As per the image height and width, adjust columns dynamically to preserve proportions) */}
        <motion.div
          id="gallery-grid"
          layout
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-5 gap-6 [column-fill:_balance]"
        >
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => (
              <motion.div
                id={`gallery-item-${item.id}`}
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="break-inside-avoid mb-6 group relative cursor-pointer overflow-hidden shadow-md border border-navy-dark/5 bg-navy-dark/5 rounded-xs transition-shadow hover:shadow-lg"
                onClick={() => openLightbox(item.id)}
              >
                <div className="absolute inset-0 bg-navy-dark/0 group-hover:bg-navy-dark/15 transition-all duration-500 z-10 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-3 group-hover:translate-y-0 z-20 bg-white/95 backdrop-blur-xs text-navy-dark font-primary text-[10px] tracking-widest uppercase font-semibold px-4 py-2 flex items-center space-x-2 border border-navy-dark/10">
                    <ZoomIn className="w-3.5 h-3.5 text-gold-warm" />
                    <span>Enlarge Masterpiece</span>
                  </span>
                </div>

                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="w-full h-auto block transform duration-1000 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state when no items found */}
        {displayItems.length === 0 && (
          <div className="text-center py-20 border border-dashed border-navy-dark/15 rounded-xs">
            <p className="font-secondary text-lg text-navy-dark italic">No items found under this luxury subset.</p>
          </div>
        )}

        {/* View Full Gallery Link on Homepage */}
        {isHomepage && displayItems.length > 0 && (
          <div className="mt-16 text-center">
            <Link
              id="view-full-gallery-link"
              to="/gallery"
              className="inline-flex items-center space-x-2 px-8 py-4 border border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white font-primary text-xs tracking-widest uppercase font-semibold transition-all duration-300 rounded-sm"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4 text-gold-warm" />
            </Link>
          </div>
        )}
      </div>

      {/* Modern Lightbox Portal */}
      <AnimatePresence>
        {activeImageIndex !== null && activeImage && (
          <motion.div
            id="gallery-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-dark/95 z-55 flex flex-col justify-between p-6 md:p-10 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Top Navigation Bar of Lightbox */}
            <div className="flex items-center justify-between pointer-events-auto h-12 w-full max-w-7xl mx-auto z-10">
              <div className="flex flex-col text-left">
                <span className="font-secondary text-md md:text-lg font-bold text-white tracking-widest">
                  ATELIER
                </span>
                <span className="font-primary text-[9px] tracking-widest text-gold-warm uppercase">
                  MASTERPIECE VIEWER
                </span>
              </div>

              {/* Close Button */}
              <button
                id="lightbox-close-btn"
                onClick={closeLightbox}
                className="p-3 bg-white/10 hover:bg-white/20 transition-all rounded-full text-white cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle Image Viewer Container with Navigation Arrows */}
            <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full group/viewer">
              {/* Previous Arrow Button */}
              <button
                id="lightbox-prev-btn"
                onClick={showPrev}
                className="absolute left-4 z-20 p-4 bg-white/5 hover:bg-white/20 text-white transition-all rounded-full opacity-60 hover:opacity-100 cursor-pointer"
                aria-label="Previous artwork"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Large Image Showcase */}
              <motion.div
                key={activeImage.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative max-h-[62vh] md:max-h-[70vh] max-w-full drop-shadow-2xl border-[5px] border-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.imageAlt}
                  className="max-h-[60vh] md:max-h-[68vh] w-auto max-w-full object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Next Arrow Button */}
              <button
                id="lightbox-next-btn"
                onClick={showNext}
                className="absolute right-4 z-20 p-4 bg-white/5 hover:bg-white/20 text-white transition-all rounded-full opacity-60 hover:opacity-100 cursor-pointer"
                aria-label="Next artwork"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Info Bar of Lightbox */}
            <div
              className="w-full max-w-3xl mx-auto bg-white/5 border border-white/10 p-5 md:p-6 backdrop-blur-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div>
                  <span className="block text-[9px] tracking-widest text-gold-warm uppercase font-bold">
                    Title & Classification
                  </span>
                  <p className="font-secondary text-base font-bold text-white mt-1">
                    {activeImage.title}
                  </p>
                  <p className="font-primary text-xs text-white/55 mt-0.5">
                    {activeImage.category}
                  </p>
                </div>

                <div>
                  <span className="block text-[9px] tracking-widest text-gold-warm uppercase font-bold">
                    Creation Detail & Size
                  </span>
                  <p className="font-primary text-sm text-white/80 mt-1">
                    Dimension: {activeImage.dimensions || "Signature Studio Scale"}
                  </p>
                  <p className="font-primary text-xs text-white/55 mt-0.5">
                    Year Released: {activeImage.year}
                  </p>
                </div>

                <div>
                  <span className="block text-[9px] tracking-widest text-gold-warm uppercase font-bold">
                    Origin & Placement
                  </span>
                  <p className="font-secondary text-sm text-white mt-1 italic flex items-center space-x-1.5">
                    <Disc className="w-3.5 h-3.5 text-gold-warm animate-spin" />
                    <span>{activeImage.location || "Available for Acquisition"}</span>
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
