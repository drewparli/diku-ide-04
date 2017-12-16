import pandas as pd

"""
This portion of the script takes the data in `hands.csv` and creates suitable string
representations of the data for each hand that can be used to draw an
svg polyline's `points` attribute.
"""
N_HANDS = 40
N_POINTS = 56

raw = pd.read_csv("hands.csv", sep=',', header=None)

polyline_data = []


with open("polyline.json", 'w') as f:
    f.write("{\n")
    f.write('    "polylines" : [\n')

    for i in xrange(N_HANDS):
        f.write('        { "points" : ')
        points = raw.values[i]
        xs = points[:N_POINTS]
        ys = points[N_POINTS:]
        points = '"'

        for j in xrange(N_POINTS):
            points += '{},{} '.format(xs[j]*200, ys[j]*200)

        if i == (N_HANDS - 1):
            points += '" }\n'
        else:
            points += '" },\n'

        f.write(points)

    f.write("    ]")
    f.write("}")


"""
This portion of the script takes the data in `hands_pca.csv` and creates
suitable representations of the first two components in the data that can be
used to draw an svg circle.
"""
raw = pd.read_csv("hands_pca.csv", sep=',', header=None)

with open("pca.json", "w") as f:
    f.write("{\n")
    f.write('    "components" : [\n')

    for i in xrange(N_HANDS):
        egen_vec = raw.values[i]
        cx = egen_vec[0]
        cy = egen_vec[1]
        temp = "        { "
        f.write(temp + '"cx" : {}, '.format(cx))
        f.write('"cy" : {}'.format(cy))

        if i == (N_HANDS - 1):
            f.write(' }\n')
        else:
            f.write(' },\n')

    f.write("    ]")
    f.write("}")