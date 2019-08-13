
function GetTransactions(databaseQuery)
{
	var transactions_table = document.getElementById("transactions-table");
	transactions_table.innerHTML = "";

	var resultsRequest = new XMLHttpRequest();
	resultsRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			var rows = JSON.parse(this.responseText);
			console.log(rows);
			for (let i = 0; i < 10; i++)
			{
				var dataTable = $('#dataTable').DataTable();
				dataTable.row.add( [ 
					rows[i]["id"],
					rows[i]["date"],
					rows[i]["info"],
					rows[i]["description"],
					rows[i]["statement"],
					rows[i]["who"],
					rows[i]["type"],
					rows[i]["amount"],
					rows[i]["category"],
					rows[i]["tag1"],
					rows[i]["tag2"],
				]).draw();
			}
		}
	};

	resultsRequest.open("POST", "../GetTransactions", true);
	resultsRequest.setRequestHeader("content-type", "application/json");
	resultsRequest.send(JSON.stringify({ query : databaseQuery }));
}

GetTransactions("SELECT * FROM transactions");

function CreateSearchQuery() 
{
	console.log("Creating search query");
	
	var databaseQuery = "SELECT * FROM transactions";
	var databaseCols = [ "id", "day", "month", "year", "info", "transactor", "statement", "who", "type", "amount", "category", "tag1", "tag2" ];

	var searchTableEntries = document.querySelectorAll("#contains-matches td");
	var firstCondition = true;
	for (let i = 1; i < searchTableEntries.length; i++)
	{
		if (searchTableEntries[i].innerHTML != "")
		{
			if (firstCondition === true) 
			{
				firstCondition = false;
				databaseQuery += " WHERE ";
			}
			else
			{
				databaseQuery += " AND ";
			}
			databaseQuery += databaseCols[i-1] + " LIKE '%" + searchTableEntries[i].innerHTML + "%'";
		}
	}

	var searchTableEntries = document.querySelectorAll("#exact-matches td");
	for (let i = 1; i < searchTableEntries.length; i++)
	{
		if (searchTableEntries[i].innerHTML != "")
		{
			if (firstCondition === true) 
			{
				firstCondition = false;
				databaseQuery += " WHERE ";
			}
			else
			{
				databaseQuery += " AND ";
			}
			databaseQuery += databaseCols[i-1] + "='" + searchTableEntries[i].innerHTML + "'";
		}
	}
	databaseQuery += ";";
	console.log(databaseQuery);
	GetTransactions(databaseQuery);
}

$('table').dataTable({searching: false, paging: false, info: false});
