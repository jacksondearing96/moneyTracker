$('table').dataTable({searching: false, paging: false, info: false});

function QueryDatabase(databaseQuery)
{
	var dataTable = $('#dataTable').DataTable();
	dataTable.clear();

	var resultsRequest = new XMLHttpRequest();
	resultsRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			if (this.responseText === "ERROR")
			{
				alert("Error querying database");
				return;
			}
			
			var rows = JSON.parse(this.responseText);
			for (let i = 0; i < rows.length; i++)
			{
				dataTable.row.add( [ 
					rows[i]["id"],
					rows[i]["day"] + "/" + rows[i]["month"] + "/" + rows[i]["year"],
					rows[i]["info"],
					rows[i]["description"],
					rows[i]["statement"],
					rows[i]["who"],
					rows[i]["type"],
					rows[i]["amount"],
					rows[i]["category"],
					rows[i]["tag1"],
					rows[i]["tag2"],
				]);
			}
			dataTable.draw();
			var transactionsTitle = document.getElementById("transactions-table-title");
			transactionsTitle.innerText = "Transactions " + "(" + rows.length + ")"
		}
	};

	resultsRequest.open("POST", "../GetTransactions", true);
	resultsRequest.setRequestHeader("content-type", "application/json");
	resultsRequest.send(JSON.stringify({ query : databaseQuery }));
}

QueryDatabase("SELECT * FROM transactions");

function SearchDatabase() 
{
	console.log("Creating search query");
	var databaseQuery = "SELECT * FROM transactions";
	databaseQuery += CurrentConditionQuery();
	console.log("Querying: ", databaseQuery);
	QueryDatabase(databaseQuery);
}

function CurrentConditionQuery()
{
	var databaseQuery = "";
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
	return databaseQuery;
}

function Delete()
{
	var dataTable = $('#dataTable').DataTable();
	var numberOfTransactions = dataTable.rows().count();
	var proceed = confirm("Delete " + numberOfTransactions + " transactions?");

	if (proceed === true)
	{
		console.log("Inserting into backup database");
		var databaseQuery = "INSERT INTO removed_transactions SELECT * FROM transactions";
		databaseQuery += CurrentConditionQuery();
		QueryDatabase(databaseQuery);
		console.log("Deleting from primary database");
		var databaseQuery = "DELETE FROM transactions";
		databaseQuery += CurrentConditionQuery();
		console.log("Delete Query: ", databaseQuery);
		// QueryDatabase(databaseQuery);
		SearchDatabase();
	}
}

function CommitDatabase()
{
	var commitRequest = new XMLHttpRequest();
	commitRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			if (this.responseText === "SUCCESS")
			{
				console.log("Commited database successfully");
			}
			else 
			{
				alert("Error commiting database");
			}
		}
	};

	commitRequest.open("GET", "../CommitDatabase", true);
	commitRequest.setRequestHeader("content-type", "application/json");
	commitRequest.send();
}