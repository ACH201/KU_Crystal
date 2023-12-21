college = {
  "전체": ["전체"],
  "문과대학": [
    "국어국문학과", "영어영문학과", "중어중문학과", "철학과", "사학과",
    "지리학과", "미디어커뮤니케이션학과", "문화콘텐츠학과"
  ],
  "이과대학": [
    "수학과", "물리", "화학과"
  ],
  "건축대학": [
    "건축학부"
  ],
  "공과대학": [
    "사회환경공학부", "기계항공공학부", "전기전자공학부", "화학공학부", "컴퓨터공학부",
    "산업공학부", "생물공학과", "K뷰티산업융합학과"
  ],
  "사회과학대학": [
    "정치외교학과", "경제학과", "행정학과", "국제무역학과", "응용통계학과",
    "융합인재학과", "글로벌비즈니스학과"
  ],
  "경영대학": [
    "경영학과", "기술경영학과"
  ],
  "부동산과학원": [
    "부동산학과"
  ],
  "KU융합과학기술원": [
    "미래에너지공학과", "스마트운행체공학과", "스마트ICT융합공학과", "화장품공학과",
    "줄기세포재생공학과", "의생명공학", "시스템생명공학과", "융합생명공학과"
  ],
  "상허생명과학대학": [
    "생명과학특성학과", "동물자원과학과", "식량자원과학과", "축산식품생명공학과", "식품유통공학과",
    "환경보건과학과", "산림조경학과"
  ],
  "수의과대학": [
    "수의예과", "수의학과"
  ],
  "예술디자인대학": [
    "커뮤니케이션디자인학과", "산업디자인학과", "의상디자인학과", "리빙디자인학과",
    "현대미술학과", "영상영화학과"
  ],
  "사범대학": [
    "일어교육과", "수학교육과", "체육교육과", "음악교육과", "교육공학과", "교직과"
  ]
}

// 'DataTable' 키에서 JSON 문자열로 저장된 데이터를 가져와서 사용
try {
  const dfJSON = localStorage.getItem(localStorage.key(0));
  let df = new dfd.DataFrame(JSON.parse(dfJSON)); // JSON 문자열을 파싱하여 DataFrame으로 변
  console.log('기존 데이터가 로드되었습니다:');
  window.df = df;
  df.asType('학년', 'string')
  df.print();
} catch (error) {
  console.error('데이터 로드 중 오류가 발생했습니다:', error);
}

function get_majors(school) {
  //단과대학별 학과 리스트를 딕셔너리로 정리
  return college[school]
}

function makestats_all(school = null, major = null, grade = null) {
  const dayDict = { '월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5 }

  // Array를 사용하여 6x23 크기의 0으로 초기화된 배열 생성
  let template = Array.from({ length: 6 }, () => Array(23).fill(0));

  if (school === null) {
    window.df = df
    let ndf = df
    window.ndf = ndf
  } else if (grade === null) {
    window.df = df;
    let new_rows = df.loc({ columns: ['전공'] }).values.flat().map((item, index) => {
      if (item.includes(school) || item.includes(major)) return index;
      else return -1;
    }).filter((item) => item !== -1);
    console.log(new_rows)
    let ndf = df.iloc({ rows: new_rows })
    window.ndf = ndf
    console.log(ndf)

  } else {
    window.df = df;
    let new_rows = df.loc({ columns: ['전공'] }).values.flat().map((item, index) => {
      if (item.includes(school) || item.includes(major)) return index;
      else return -1;
    }).filter((item) => item !== -1);

    let ndf = df.iloc({ rows: new_rows })

    new_rows = ndf.loc({ columns: ['학년'] }).values.flat().map((item, index) => {
      if (item.includes(grade)) return index;
      else return -1;
    }).filter((item) => item !== -1);

    ndf = df.iloc({ rows: new_rows })
    window.ndf = ndf
    console.log(ndf)
  }

  let timetable = {};

  for (let i = 0; i < ndf.loc({ columns: ['강의실'] }).values.flat().length; i++) {
    let rowIndex = i;
    let row = ndf.iloc({ rows: [rowIndex] });

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

  let classCountOnTime = Array.from({ length: 6 }, () => Array(23).fill(0));

  for (const room in timetable) {
    const roomInfo = timetable[room];
    for (let day = 0; day < 6; day++) {
      for (let time = 0; time < 23; time++) {
        if (roomInfo[day][time] === 1) {
          classCountOnTime[day][time] += 1;
        }
      }
    }
  }
  return classCountOnTime
}

let majors_dropdown = document.querySelector("#majors");
let school = document.querySelector("#schools");
let grades_dropdown = document.querySelector("#grades");
let plot = document.querySelector("#plot");

function update_majors() {
  //단과대학이 '전체'가 아닐 때 학과 드롭다운을 활성화하고 해당 학과 목록을 업데이트
  let selected = school.value;
  majors_dropdown.innerHTML = '';

  if (selected === "전체") {
    majors_dropdown.disabled = true;
    grades_dropdown.disabled = true;
    let option = document.createElement("option");
    option.value = "전체";
    option.innerHTML = "전체";
    majors_dropdown.appendChild(option);
  } else {
    majors_dropdown.disabled = false;
    grades_dropdown.disabled = false;
    let curr_majors = get_majors(selected);
    console.log(curr_majors);

    for (let major of curr_majors) {
      let option = document.createElement("option");
      option.value = major;
      option.innerHTML = major;
      majors_dropdown.appendChild(option);
    }
  }
}

const resultArea = document.querySelector("#result");

function button_click_event() {
  const loadingMessage = "<span class='letter'>로</span><span class='letter'>딩</span><span class='letter'>중</span><span class='letter'>.</span><span class='letter'>.</span><span class='letter'>. </span><span class='letter'>잠</span><span class='letter'>시</span><span class='letter'>만 </span><span class='letter'>기</span><span class='letter'>다</span><span class='letter'>려 </span><span class='letter'>주</span><span class='letter'>세</span><span class='letter'>요</span><span class='letter'>.</span>";
  resultArea.innerHTML = loadingMessage;

  setTimeout(() => {
    plot.innerHTML = '';

    const sch = school.value;
    const major = majors_dropdown.value;
    const grade = grades_dropdown.value;
    let data;

    if (sch === '전체') {
      data = makestats_all();
    } else if (grade === '전체') {
      data = makestats_all(sch, major);
    } else {
      data = makestats_all(sch, major, grade);
    }

    if (data !== null) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const hours = [...Array(23).keys()].map(i => (i + 1).toString());

      const heatmapData = data.map((row, dayIndex) => {
        return row.map((count, hourIndex) => {
          return {
            day: days[dayIndex],
            hour: hours[hourIndex],
            count: count
          };
        });
      }).flat();

      const margin = { top: 50, right: 30, bottom: 50, left: 80 };
      const width = 1100 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select("#plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, d3.max(heatmapData, d => d.count)]);

      const x = d3.scaleBand()
        .domain(hours)
        .range([0, width]);

      const y = d3.scaleBand()
        .domain(days)
        .range([0, height]);

      const xAxis = d3.axisTop(x).tickSize(0);
      const yAxis = d3.axisLeft(y).tickSize(0);

      svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "16px");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "16px");

      svg.selectAll(".heatmap-rect")
        .data(heatmapData)
        .enter().append("rect")
        .attr("class", "heatmap-rect")
        .attr("x", d => x(d.hour))
        .attr("y", d => y(d.day))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => color(d.count))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      // create a tooltip
      const tooltip = d3.select("#plot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

      const time_col = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
      ];

      function mouseover(d) {
        tooltip.style("opacity", 1);
        d3.select(this)
          .style("stroke", "red")
          .style("stroke-width", 3)
      }

      function mousemove(evemt, d) {
        // 해당 셀의 행과 열 인덱스 가져오기
        var cellRow = d3.pointer(event)[1];
        var cellColumn = d3.pointer(event)[0];

        // day와 hour 계산
        var dayIndex = Math.floor(cellRow / (height / days.length));
        var hourIndex = Math.floor(cellColumn / (width / hours.length));
        var day = days[dayIndex];
        var hour = hours[hourIndex];

        // count 찾기
        var count;
        heatmapData.forEach(function (data) {
          if (data.day === day && data.hour === hour) {
            count = data.count;
          }
        });

        tooltip
          .html(day + "  " + time_col[hour - 1] + "<br>강의 수: " + count)
          .style("left", (event.pageX + 20) + "px")
          .style("top", (event.pageY - 20) + "px");
      };

      function mouseleave(d) {
        tooltip.style("opacity", 0);
        d3.select(this)
          .style("stroke-width", 1)
          .style("stroke", "none")
      }
      resultArea.innerHTML = '';
    }
  }, 1000);
}