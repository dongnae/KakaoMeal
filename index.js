/*  MealKakaoBot, 동래고등학교 급식 챗봇 프로그램
    Copyright (C) 2019  박찬솔

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
process.env.TZ = "Asia/Seoul";

const neis = require("neis");
const school = neis.createSchool(neis.REGION.BUSAN, "C100000394", neis.TYPE.HIGH);

const clean_meal_detail = text => text.replace(/\(.*\)/gi, "");
const meal_type = ["", "조식", "중식", "석식"];

const app = require("express")();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/skill/meal', async (req, res) => {
	let body = req.body;
	if (body.bot === undefined || body.bot.id === undefined || body.bot.id.indexOf("5c8e305b384c550f44a18bff") < 0) {
		res.status(403).send("Forbidden");
		return;
	}
	
	let meal, day = new Date(), output = [];
	await school.getMeal(day.getFullYear(), day.getMonth() + 1).then(d => meal = d);
	
	meal = meal[day.getDate()];
	
	for (let i = 1; i <= 3; i++) {
		if (meal.getString(i) !== "") {
			output.push(Object.assign({
					"title": `${day.getMonth() + 1}월 ${day.getDate()}일  ${meal_type[i]}`,
					"description": clean_meal_detail(neis.removeAllergy(meal.lunch))
				},
				(i === 1 ? {
					"buttons": [
						{
							"action": "webLink",
							"webLinkUrl": "https://t.me/school_kr_bot",
							"label": "텔레그램"
						}
					]
				} : {})
			));
		}
	}
	
	if (!output.length) {
		output = [{
			"title": `${day.getMonth() + 1}월 ${day.getDate()}일  급식 정보`,
			"description": "이 날의 급식이 없습니다.",
			"buttons": [
				{
					"action": "webLink",
					"webLinkUrl": "https://t.me/school_kr_bot",
					"label": "텔레그램"
				}
			]
		}];
	}
	
	const responseBody = {
		"version": "2.0",
		"template": {
			"outputs": [
				{
					"carousel": {
						"type": "basicCard",
						"items": output
					}
				}
			]
		}
	};
	
	res.status(200).send(responseBody);
});

app.listen(444, () => {
	console.log("동래고 전용 급식봇이 켜졌습니다.");
});