#!/usr/bin/env python3

import csv
import json
import requests
import sys
import datetime


def process_csv():
    eventReader = csv.reader(open("calendrierv3.csv"), delimiter=",")

    for row in eventReader:
        # print(row)

        #     {
        #   "geometry": {
        #     "type": "Point",
        #     "coordinates": [
        #       4.9290, 45.1804
        #     ]
        #   },
        #   "properties": {
        #     "createdate": "2019-04-22",
        #     "label": "Course d'orientation Longue Distance au bois de Suze",
        #     "lastupdate": "2019-04-22",
        #     "lat": 45.185024,
        #     "lon": 4.93085,
        #     "source": "http://romans.orientation.free.fr/index.php?article194/course-departementale-longue-distance-a-saint-donat-25-mai",
        #     "type": "scheduled",
        #     "what": "sport.orienteering",
        #     "when": "2019-04-23"
        #   },
        #   "type": "Feature"
        # }

        try:
            event_date = datetime.datetime.strptime(row[0], "%d/%m/%Y").strftime("%Y-%m-%d")
            name = row[3]
            website = row[19]
            lat = float(row[21])
            lon = float(row[22])
        except Exception as e:
            print(f"could not parse CSV entry {row}: {e}")
            continue

        properties = {}
        properties["label"] = name
        properties["lat"] = lat
        properties["lon"] = lon
        properties["source"] = website
        properties["type"] = "scheduled"
        properties["what"] = "sport.orienteering.test"
        properties["when"] = event_date

        geometry = {}
        geometry["type"] = "Point"
        geometry["coordinates"] = [lon, lat]

        obj = {}
        obj["geometry"] = geometry
        obj["properties"] = properties
        obj["type"] = "Feature"

        submit_event(json.dumps(obj))


def submit_event(data):
    # print(data)
    url = "http://api.openeventdatabase.org/event"

    resp = requests.post(url, data=data)

    if resp.status_code == 201:
        print(f"Event created successfully ({resp.status_code}): {resp.text}")
    elif resp.status_code == 409:
        print(f"Event already exists, skipping: {resp.text}")
    elif resp.status_code >= 400:
        print(f"Event could not be created ({resp.status_code}): {resp.text}")
        sys.exit(1)
    else:
        print(f"Unknown response ({resp.status_code}): {resp.text}")


if __name__ == "__main__":
    process_csv()
