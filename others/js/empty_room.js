// 'DataTable' 키에서 JSON 문자열로 저장된 데이터를 가져와서 사용
try {
    const dfJSON = localStorage.getItem(localStorage.key(0));
    const df = new dfd.DataFrame(JSON.parse(dfJSON)); // JSON 문자열을 파싱하여 DataFrame으로 변
    console.log('기존 데이터가 로드되었습니다:');
    window.df = df;
    df.asType('학년', 'string')
    df.print();
} catch (error) {
    console.error('데이터 로드 중 오류가 발생했습니다:', error);
}

function get_emptylist(building, time, day) {
    const dayDict = { '월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5 }

    // Array를 사용하여 6x23 크기의 0으로 초기화된 배열 생성
    let template = Array.from({ length: 6 }, () => Array(23).fill(0));
    let timetable = {};

    for (let i = 0; i < df.loc({ columns: ['강의실'] }).values.flat().length; i++) {
        let rowIndex = i;
        let row = df.iloc({ rows: [rowIndex] });

        let room = row.loc({ columns: ['강의실'] }).values[0][0];
        let day = row.loc({ columns: ['요일'] }).values[0][0];
        let times = row.loc({ columns: ['강의시간'] }).values[0][0].split('-');
        let start_time = parseInt(times[0]) - 1;
        let end_time = parseInt(times[1]);

        // timetable 및 classtable에 강의실이 이미 있는 경우
        if (timetable[room]) {
            for (let i = start_time; i < end_time; i++) {
                timetable[room][dayDict[day]][i] = 1;
            }
        } else {
            let copied_template = JSON.parse(JSON.stringify(template));
            for (let i = start_time; i < end_time; i++) {
                copied_template[dayDict[day]][i] = 1;
            }
            timetable[room] = copied_template;
        }
    }
    let classroom = [];
    let data = Object.keys(timetable);
    let result = process_data(data, classroom);
    let classroomData = {};

    for (let [key, value] of Object.entries(result)) {
        if (!key.includes("온라인") && !key.includes("미배정")) {
            classroomData[key] = value;
        }
    }

    // 4개씩 잘라서 문자열로 출력
    let resultArray = [];
    if (classroomData[building]) {
        let rooms = classroomData[building];
        rooms.forEach((room) => {
            if (timetable[room]) {
                let schedule = timetable[room];
                if (schedule[dayDict[day]][time - 1] === 0) {
                    resultArray.push(room);
                }
            }
        });
    }
    return resultArray
}
function splitStringByNumber(s) {
    return s.split(/(\d+)/);
}

function process_data(data, classroom) {
    let result = {};
    for (let item of data) {
        let classroom = splitStringByNumber(item)[0];
        if (result[classroom]) {
            result[classroom].push(item);
        } else {
            result[classroom] = [item];
        }
    }
    return result;
}

const buildings = document.querySelector("#buildings");
const days = document.querySelector("#day");
const times = document.querySelector("#time");
const resultArea = document.querySelector("#result");

function button_click_event() {
    const loadingHTML = "<span class='letter'>로</span><span class='letter'>딩</span><span class='letter'>중</span><span class='letter'>.</span><span class='letter'>.</span><span class='letter'>. </span><span class='letter'>잠</span><span class='letter'>시</span><span class='letter'>만 </span><span class='letter'>기</span><span class='letter'>다</span><span class='letter'>려 </span><span class='letter'>주</span><span class='letter'>세</span><span class='letter'>요</span><span class='letter'>.</span>";
    resultArea.innerHTML = loadingHTML

    setTimeout(() => {
        const b = buildings.value;
        const d = days.value;
        const t = parseInt(times.value);
        const result = get_emptylist(b, t, d);
        console.log(b, t, d);
        console.log(result);

        const keys = [...new Set(result.map(item => parseInt(item.slice(b.length))))].sort((a, b) => a - b);
        const resultDict = {};
        keys.forEach(key => {
            resultDict[key.toString()] = [];
        });

        console.log(resultDict);
        result.forEach(item => {
            const key = parseInt(item.slice(b.length));
            resultDict[key.toString()].push(item);
        });

        keys.forEach(key => {
            resultDict[key.toString()].unshift(key.toString() + ' 층');
        });

        const maxLength = Math.max(...Object.values(resultDict).map(arr => arr.length));
        keys.forEach(key => {
            while (resultDict[key.toString()].length < maxLength) {
                resultDict[key.toString()].push(' ');
            }
        });

        resultArea.innerHTML = '';

        let timeTableObject = document.querySelector('#timetable tbody')
        timeTableObject.innerHTML = ''

        for (let i = 0; i < maxLength; i++) {
            let tr = document.createElement('tr');
            keys.forEach(key => {
                let td = document.createElement('td');
                td.textContent = resultDict[key.toString()][i].toString();
                tr.appendChild(td);
            })
            timeTableObject.appendChild(tr);
        }
    }, 1000);
}