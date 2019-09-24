(function () {
	
	var showLinkedTicket=true;

	var opt={
		type:"GET"
	};

	relativeUrl=null;
	var apiKey=null;

	/**
	 * Fonction qui permet de faire un requête Ajax en gérant l'authentification
	 */
	function getJson(url,callback){
		var json2={
			url:relativeUrl+url
		};
		if(apiKey!=null){
			json2.data={
				key:apiKey
			}
		}
		var json1= jQuery.extend(opt,json2);
		jQuery.ajax(json1).done(callback).fail(function( jqXHR, textStatus ) {
		  alert( "Please check if you enable rest and jsonp in Administration > Settings > Authentication\n\nDetails : " + textStatus );
		});

	}
	

	jQuery(window).load(function(){
		relativeUrl=jQuery('#relativeUrl').val();
		apiKey=jQuery('#apiKey').val();
	
			jQuery('.ticket-modele').hide();
			jQuery('#project').empty();
			jQuery('#search-assigned').empty();
			getJson("/projects.json",function(data){
				jQuery('#project').append(jQuery('<option>').html('----------').attr('value',0));
				for(i=0;i<data.projects.length;i++){
					jQuery('#project').append(jQuery('<option>').html(data.projects[i].name).attr('value',data.projects[i].id));
				}
				
			});

			getJson('/groups.json',function(data){
				jQuery('#search-group').append(jQuery('<option>').html('----------').attr('value',0));
				for(i=0;i<data.groups.length;i++){
					jQuery('#search-group').append(jQuery('<option>').html(data.groups[i].name).attr('value',data.groups[i].id));
				}
			});

			

			jQuery('#search-group').change(refreshUser);
			refreshUser();//On load, we show all users

			setTimeout(function(){
				//Wait 1 second for ajax request before show form
				jQuery('.project-form').show();
			},1000);

			jQuery('.project-form .submit1').click(function(){
				console.log('submit1');
				load(false);
			});
			jQuery('.project-form .submit2').click(function(){
				console.log('submit2');
				load(true);
			});
			jQuery('#buttonClear').click(function(){
				jQuery('#tickets').empty();
			});


	});

	/**
	* Refresh users list depending group selected or not
	*/
	function refreshUser(){
				var urlUsers="/users.json";
				if(parseInt(jQuery('#search-group').val())>0){
					urlUsers=urlUsers+'?group_id='+jQuery('#search-group').val();
				}
				jQuery('#search-assigned').empty();
				getJson(urlUsers,function(data){
					jQuery('#search-assigned').append(jQuery('<option>').html('----------').attr('value',0));
					for(i=0;i<data.users.length;i++){
						jQuery('#search-assigned').append(jQuery('<option>').html(data.users[i].firstname+" "+data.users[i].lastname).attr('value',data.users[i].id));
					}
					jQuery('.project-form').show();
				});
	}

	/**
	* Function call to load tickets
	*/
	function load(clearBefore){
		var url=null;
		if(jQuery('#search-id').val()!=''){
			//Recherche par id
			url='/issues/'+jQuery('#search-id').val()+'.json';

			if(showLinkedTicket){
				url=url+'?include=relations';
			}
		}else{
			//Recherche sur une liste
			url='/issues.json?limit=5000';
			if(jQuery('#project').val()!='0'){
				url=url+'&project_id='+jQuery('#project').val();
			}
			if(jQuery('#search-assigned').val()!='0'){
				url=url+'&assigned_to_id='+jQuery('#search-assigned').val();
			}
			if(jQuery('#date-since').val()!=''){
				url=url+'&created_on=%3E%3D'+jQuery('#date-since').val();
			}
			if(jQuery('#tracker').val()!=''){
				url=url+'&tracker_id='+jQuery('#tracker').val();
			}
			if(showLinkedTicket){
				url=url+'&include=relations';
			}
		}
		
		
	
		getJson(url,function(data){
			var ticketCardModele=jQuery('.ticket-modele');
			var tickets=jQuery('#tickets');
			if(clearBefore){
				tickets.empty();
			}
			if(data.issues){
				for(i=0;i<data.issues.length;i++){
					var issue=data.issues[i];					
					tickets.append(getDivPostIssue(ticketCardModele,issue));
				}
				if(data.total_count>data.limit){
					alert(data.limit+"/"+data.total_count);
				}
			}else{
				tickets.append(getDivPostIssue(ticketCardModele,data.issue));
			}
		})
		
		//Empty ticket id to start again
		jQuery('#search-id').val('');
	}
	
	/**
	 * 
	 * Fonction qui 
	 */
	function getDivPostIssue(ticketCardModele,issue){
		console.log("getDivPostIssue(issue="+JSON.stringify(issue)+")");
		var ticketCard=ticketCardModele.clone().removeClass('ticket-modele').addClass('project'+issue.project.id).show();

		jQuery('.id',ticketCard).html(issue.id).attr('href',relativeUrl+'/issues/'+issue.id);
		jQuery('.project',ticketCard).html(issue.project.name).attr('href',relativeUrl+'/projects/'+issue.project.name+'/issues');
		jQuery('.subject',ticketCard).html(issue.subject);
		jQuery('.status',ticketCard).html(issue.status.name);
		jQuery('.author',ticketCard).html(issue.author.name);
		if(issue.category){
			jQuery('.category',ticketCard).html(issue.category.name);
		}else{
			jQuery('.category',ticketCard).closest('.line').hide();
		}
		
		jQuery('.createdOn',ticketCard).html(dateFormat(new Date(issue.created_on),"yyyy-mm-dd"));
		
		if(issue.due_date){
			jQuery('.commitedDate',ticketCard).html(dateFormat(new Date(issue.due_date),"yyyy-mm-dd"));
		}else{
			jQuery('.commitedDate',ticketCard).html();
		}
		
		if(issue.estimated_hours){
			jQuery('.estimatedHour',ticketCard).html(issue.estimated_hours);
		}else{
			jQuery('.estimatedHour',ticketCard).html();
		}

		if (issue.spent_hours) {
			jQuery('.spendTime',ticketCard).html(issue.spent_hours);
		} else {
			jQuery('.spendTime',ticketCard).html();
		}
		
		if(showLinkedTicket && issue.relations && issue.relations.length>0){
			console.log(JSON.stringify(issue.relations));
			var x_issues=new Array();
			for (var i=0;i<issue.relations.length;i++){
			  var il=issue.relations[i];
			  if(issue.id==il.issue_id) { x_issues[i]= il.issue_to_id; }
			  else { x_issues[i]= il.issue_id; }
			}
			var text= JSON.stringify(x_issues);
			jQuery('.linked span',ticketCard).html(text);
			jQuery('.linked',ticketCard).show();
		} else {
			jQuery('.linked',ticketCard).hide();
		}
		jQuery('.line.custom-field').hide();
		if(issue.custom_fields){
			for (var i=0;i<issue.custom_fields.length;i++){
				if(issue.custom_fields[i].id=='12'){
					//Nom du demandeur
					if(issue.custom_fields[i].value=="Moi"){
						jQuery('.demandeur span',ticketCard).html(issue.author.name);
					}else{
						jQuery('.demandeur span',ticketCard).html(issue.custom_fields[i].value);
					}
					jQuery('.demandeur').show();
				}
				if(issue.custom_fields[i].id=='13'){
					//Date souhaité
					if(issue.custom_fields[i].value){
						jQuery('.requestedDate span',ticketCard).html(dateFormat(new Date(issue.custom_fields[i].value),"yyyy-mm-dd"));
					}
					jQuery('.requestedDate').show();
				}
			}
		}

		ticketCard.addClass("priority"+issue.priority.id);
		return ticketCard;
	}

}());

