import os
import sys
from datetime import datetime

import pandas as pd


def data_cleaning(filepath):
    df = pd.read_excel(filepath, dtype=str)

    # 필요한 열만 가져오기
    need_column = ['학년', '학수번호', '교과목명', '수강\n학부(과)/전공', '강의요시/강의실', '담당교수']
    drop_columns = []
    for column in df.columns:
        if column not in need_column:
            drop_columns.append(column)
        else:
            pass
    df.drop(drop_columns, axis=1, inplace=True)
    for column in df.columns:
        df.rename(columns={column: column.replace('\n', '')}, inplace=True)
        df.rename(columns={column: column.replace('\r', '')}, inplace=True)

    # 강의실 없는 과목 제외하기
    df = df.dropna(subset=['강의요시/강의실'])

    # e-러닝 제외하기
    df = df[df['강의요시/강의실'].apply(lambda x: True if 'e' not in x else False)]
    df.index = range(len(df))

    df = df[['교과목명', '담당교수', '수강학부(과)/전공', '학년', '학수번호', '강의요시/강의실']]
    df.columns = ['과목명', '교수', '전공', '학년', '학수번호', '강의']

    # 행 쪼개기
    ndf = pd.DataFrame(columns=['과목명', '교수', '전공', '학년', '학수번호', '강의'])
    rd_loc = 0
    for i, row in df.iterrows():
        a, b, c, d, e = row['과목명'], row['교수'], row['전공'], row['학년'], row['학수번호']
        for s in row['강의'].split(', '):
            s = str(s).strip()
            ndf.loc[rd_loc] = [a, b, c, d, e, s]
            rd_loc += 1

    # 열 쪼개기
    adcol = []
    for i in range(len(ndf['강의'])):
        adcol.append([ndf['강의'][i][ndf['강의'][i].find('(') + 1:-1], ndf['강의'][i][0], ndf['강의'][i][1:6]])
    addf = pd.DataFrame(adcol, columns=['강의실', '요일', '강의시간'])
    ndf = pd.concat([ndf, addf], axis=1)
    ndf.drop('강의', axis=1, inplace=True)

    return ndf


def resource_path(relatvie_path):
    try:
        base_path = sys.MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relatvie_path)


dset = data_cleaning(resource_path('종합강의시간표내역.xlsx'))
filepath = resource_path('LectureTable(' + str(datetime.now().date()) + ').csv')

dset.to_csv(filepath, index=False)
