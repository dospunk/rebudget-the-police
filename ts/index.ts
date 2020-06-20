//TODO: make a type definition for the data

const g_copBlue: string = "#0000ff";
const g_budgetAdjustmentsDisplay: string = "block";
let g_chart: Chart;
let g_departmentOptions: HTMLOptionElement[] = [];
let g_originalBudgetValues: number[] = [];
let g_policeLabel: string;

$(document).ready(function() {
	$('.select2').select2();
	
	$('#budgetSelectForm').submit(function(evt){
		evt.preventDefault();
        const form: HTMLFormElement = evt.currentTarget as HTMLFormElement;
        const fd: FormData = new FormData(form);
        const dataPath: string = 
            `data/${fd.get("state")}/${fd.get("city")}/${fd.get("year")}.json`;
		$.getJSON(dataPath, (data: BudgetData)=>{
            console.dir(data);//DEV
            for (let i = 0; i < data.excludes.length; i++) {
                delete data.budget[data.excludes[i]];
                
            }
            g_policeLabel = data.policeLabel;
            createGraph(data);
            showAdjustmentControls();
            discloseExcludes(data.excludes);
		});
	});
});

function createGraph(data: BudgetData): void{
	const budgetObj = data.budget;
	const budget = [];
	for (const department in budgetObj) {
		if (budgetObj.hasOwnProperty(department)) {
			budget.push([department, budgetObj[department]]);
		}
	}
	budget.sort((a, b): number=>{
		return b[1] - a[1];
	});
	const departments: string[] = budget.map(elem => elem[0]);
    const values: number[] = budget.map(elem => elem[1]);
    
    g_originalBudgetValues = [...values];
    
    createDepartmentOptionsArray(departments, data.policeLabel);

	const colors: string[] = randomColor({count: departments.length});
	colors[departments.indexOf(data.policeLabel)] = g_copBlue;

	const ctx: CanvasRenderingContext2D = ($("#graph")[0] as HTMLCanvasElement).getContext('2d');
	g_chart = new Chart(ctx, {
		type: "pie",
		data: {
			labels: departments,
			datasets: [{
				data: values,
				borderWidth: 1,
				backgroundColor: colors
			}]
		}
	});
}

function showAdjustmentControls(): void {
    /*$.each($(".receivingDepartment"), (idx, val)=>{
        for (let i = 0; i < g_departmentOptions.length; i++) {
            val.append(g_departmentOptions[i]);
        }
    });*/
    $("#budgetAdjustments").html("");
    addAdjustmentLine();
    $("#budgetAdjustmentsContainer").show();
}

function createDepartmentOptionsArray(departments: string[], policeLabel: string): void {
    departments.sort();
    $.each(departments, (idx, val)=>{
        if (val !== policeLabel) {
            let elem: HTMLOptionElement = document.createElement("option");
            elem.innerHTML = val;
            elem.setAttribute("value", val);
            g_departmentOptions.push(elem);
        }
    });
}

function addAdjustmentLine(): void{
    let optionsString: string = "";
    for (let i = 0; i < g_departmentOptions.length; i++) {
        optionsString += g_departmentOptions[i].outerHTML;
    }
    $("#budgetAdjustments").append(`
    <div class="adjustment">
        Move <input type="number" min="0" max="100" class="adjustmentAmount" value="0">%
        of the police budget to <select class="receivingDepartment select2">${optionsString}</select>
        <button onclick="removeAdjustmentLine(this)">X</button>
    </div>`);
    $('.select2').select2();
}

function removeAdjustmentLine(elem: HTMLButtonElement): void {
    console.log("removing adjustment line");//DEV
    let p: HTMLElement = $(elem).parent()[0];
    p.remove();
}

function applyAdjustments(): void {
    g_chart.data.datasets[0].data = [...g_originalBudgetValues];
    let chartData = g_chart.data.datasets[0].data as number[]; //note this is a reference!
    const depts = g_chart.data.labels;
    $.each($(".adjustment"), (idx, val)=>{
        const policeIndex: number = g_chart.data.labels.indexOf(g_policeLabel);
        const percent: number = ($(val).children(".adjustmentAmount").val() as number)/100;
        const amnt: number = percent * g_originalBudgetValues[policeIndex];
        const toDepartment: string = $(val).children(".receivingDepartment").val() as string;
        const toDepartmentIndex: number = g_chart.data.labels.indexOf(toDepartment);
        chartData[policeIndex] -= amnt;
        chartData[toDepartmentIndex] += amnt;
        g_chart.update();
    });
}

function discloseExcludes(excludes: string[]) {
    let excludesList: JQuery<HTMLElement> = $("#excludes").children("ul") as JQuery<HTMLElement>;
    if (excludes.length > 0) {
        $.each(excludes, (idx, val)=>{
            excludesList.append(`<li>${val}</li>`);
        });
        $("#excludes").show();
    } else {
        excludesList.html("");
        $("#excludes").hide();
    }
}