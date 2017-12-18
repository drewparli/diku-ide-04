import json
import numpy as np
import pandas as pd

def component_raw(data):
    res = []
    extremes = []
    for row in data.values:
        temp = np.round(row, 4)
        extremes.append(np.min(temp))
        extremes.append(np.max(temp))
        res.append(temp.tolist())
    print "Min-Max Range for the PCA data"
    print np.min(extremes), np.max(extremes)
    return res

def component_circles(data):
    res = []
    for row in data.values:
        entry = dict()
        entry["cx"] = row[0]
        entry["cy"] = row[1]
        res.append(entry)
    return res

def outline_points(data):
    res = []
    extremes = []
    for row in data.values:
        temp = np.round(row, 4).tolist()
        extremes.append(np.max(temp))
        extremes.append(np.min(temp))
        xs = temp[:56]
        ys = temp[56:]
        res.append(zip(xs, ys))
    print "Min-Max Range for the Outline point data:"
    print np.min(extremes), np.max(extremes)
    return res

def outline_paths(point_arrs):
    res = []
    for arr in point_arrs:
        d = []
        for i, point in enumerate(arr):
            if i == 0:
                d.append("M{} {}".format(point[0], point[1]))
            else:
                d.append("L{} {}".format(point[0], point[1]))
        res.append(" ".join(d))
    return res


if __name__ == '__main__':

    N_HANDS = 40
    N_POINTS = 56

    hands = pd.read_csv("hands.csv", sep=',', header=None)
    pca = pd.read_csv("hands_pca.csv", sep=',', header=None)

    data = dict()
    data["outlines"] = dict()
    data["outlines"]["points"] = outline_points(hands)
    data["outlines"]["paths"] = outline_paths(data["outlines"]["points"])

    data["components"] = dict()
    data["components"]["raw"] = component_raw(pca)
    data["components"]["circles"] = component_circles(pca)

    # print json.dumps(data["outlines"]["points"])
    with open("hands.json", "w") as f:
        f.write(json.dumps(data))
