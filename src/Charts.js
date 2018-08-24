import React, { Component } from 'react';
import { Chart, Axis, Series, Tooltip, Cursor, Bar, Pie } from "react-charts";


class Charts extends Component {
	constructor(props) {
		super(props);
		this.state = {
			expenses: [],
			categories: []
		};

	}

	async componentDidMount() {
		try {
			const expensesResponse = await fetch('https://expense-manager.thinkingpandas.com:443/api/expenses')
			const expensesJson = await expensesResponse.json();

			const categoriesResponse = await fetch('https://expense-manager.thinkingpandas.com:443/api/categories')
			const categoriesJson = await categoriesResponse.json();

			const totalExpensesResponse = await fetch('https://expense-manager.thinkingpandas.com:443/api/total_expenses')
			const totalExpensesJson = await totalExpensesResponse.json();

			this.setState({ 
				expenses: expensesJson,
				categories: categoriesJson,
				total: totalExpensesJson.data.totalExpenses,
			});
		} catch (error) {
			console.log(error);
		}
	}

	getData() {
    	const { categories } = this.state, { expenses } = this.state, { total } = this.state;
		var category = [{ total_amount: [], percentage: [] }],
		expense_data = [{ date: [], total: [] }],
		bar_data = [{ label: 'Total Amount (₱)', data: [] }],
		doughnut_data = [{ label: 'Total Amount (₱)', data: [] }];

		categories.forEach((categories, i) => {
			var total_price = 0, j = 0;
			expenses.forEach((expenses) => {
				if(expenses.category['id'] === categories.id) total_price += expenses.value;
				var dates = new Intl.DateTimeFormat('en-US', {year:'numeric',month:'short',day:'2-digit'}).format(new Date(expenses.date));
				if(!expense_data[0]['date'].includes(dates)) {
					expense_data[0]['date'][j] = dates;
					expense_data[0]['total'][j] = 0;
					j++;
				}
			});
			category[0]['total_amount'][i] = total_price;
			category[0]['percentage'][i] = Number((category[0]['total_amount'][i] / total) * 100).toFixed(2);
			doughnut_data[0]['data'].push({ x: categories.title+' '+category[0]['percentage'][i]+'%', y: category[0]['total_amount'][i].toFixed(2) });
		});
		expenses.forEach((expenses) => {
			var dates = new Intl.DateTimeFormat('en-US', {year:'numeric',month:'short',day:'2-digit'}).format(new Date(expenses.date));
			expense_data[0]['date'].forEach((date, n) => {
				if(date === dates) expense_data[0]['total'][n]+=expenses.value;
			});
		});

		expense_data[0]['date'].forEach((date, i) => {
			bar_data[0]['data'].push({ x: date, y: expense_data[0]['total'][i] });
		});

		if (categories.length !== 0) {
			var doughnutChart = <Chart data={doughnut_data}><Axis type="pie" /><Series type={Pie} showPoints={false} /><Tooltip /></Chart>,
			barChart = <Chart data={bar_data}><Axis primary type="ordinal" position="left" /><Axis type="linear" stacked position="bottom" /><Series type={Bar} /><Cursor primary /><Cursor /><Tooltip /></Chart>;
		}

		return (
			<div className="Chart">
				<div className="bar">
					{barChart}
				</div>
				<div className="doughnut">
					{doughnutChart}
				</div>
			</div>
		);
	}


	render () {
		return (
			<div>
				<div className="title-bar">Expense Manager</div>
					{this.getData()}
			</div>
		);
	}

}


export default Charts;