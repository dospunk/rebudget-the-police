$(document).ready(function() {
	$('.select2').select2();
	
	$('#budgetSelectForm').submit(function(evt){
		evt.preventDefault();
		let form = evt.currentTarget as HTMLFormElement;
		let fd = new FormData(form);
		$.getJSON(`data/${fd.get("state")}/${fd.get("city")}/${fd.get("year")}.json`, (data)=>{
            console.dir(data);
            createGraph(data.budget);
        });
    });
    
    function createGraph(budget){
        const ctx = ($("#graph")[0] as HTMLCanvasElement).getContext('2d');
        const chart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: budget.keys(),
                datasets: [{
                    data: budget.values(),
                    borderWidth: 1
                }]
            }
        });
    }
});

