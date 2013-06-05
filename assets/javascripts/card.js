(function () {

	/**
	* Use to filter assigned list
	*/
	var groupId=null;

	var opt={
		type:"GET",
		dataType: 'jsonp'
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
		jQuery.ajax(json1).done(callback);

	}
	

	jQuery(window).load(function(){
		relativeUrl=jQuery('#relativeUrl').val();
		apiKey=jQuery('#apiKey').val();
	
			jQuery('.ticket-modele').hide();
			jQuery('#projet').empty();
			jQuery('#search-assigned').empty();
			getJson("/projects.json",function(data){
				jQuery('#projet').append(jQuery('<option>').html('----------').attr('value',0));
				for(i=0;i<data.projects.length;i++){
					jQuery('#projet').append(jQuery('<option>').html(data.projects[i].name).attr('value',data.projects[i].id));
				}
				
				var urlUsers="/users.json";
				if(groupId!=null){
					urlUsers=urlUsers+'?group_id='+groupId;
				}
				getJson(urlUsers,function(data){
					jQuery('#search-assigned').append(jQuery('<option>').html('----------').attr('value',0));
					for(i=0;i<data.users.length;i++){
						jQuery('#search-assigned').append(jQuery('<option>').html(data.users[i].firstname+" "+data.users[i].lastname).attr('value',data.users[i].id));
					}
					jQuery('.project-form').show();
				});
			});
			jQuery('.project-form .submit').click(function(){
				var url=null;
				if(jQuery('#search-id').val()!=''){
					//Recherche par id
					url='/issues/'+jQuery('#search-id').val()+'.json';
				}else{
					//Recherche sur une liste
					url='/issues.json?limit=5000';
					if(jQuery('#projet').val()!='0'){
						url=url+'&project_id='+jQuery('#projet').val();
					}
					if(jQuery('#search-assigned').val()!='0'){
						url=url+'&assigned_to_id='+jQuery('#search-assigned').val();
					}
					if(jQuery('#date-since').val()!=''){
						url=url+'&created_on=%3E%3D'+jQuery('#date-since').val();
					}
				}
			
				getJson(url,function(data){
					var ticketCardModele=jQuery('.ticket-modele');
					var tickets=jQuery('#tickets').empty();
					if(data.issues){
						for(i=0;i<data.issues.length;i++){
							var issue=data.issues[i];					
							tickets.append(getDivPostIssue(ticketCardModele,issue));
						}
					}else{
						tickets.append(getDivPostIssue(ticketCardModele,data.issue));
					}
				})
			});
		

	});
	
	/**
	 * 
	 * Fonction qui 
	 */
	function getDivPostIssue(ticketCardModele,issue){
		var ticketCard=ticketCardModele.clone().removeClass('ticket-modele').show();
		jQuery('.id',ticketCard).html(issue.id);
		jQuery('.subject',ticketCard).html(issue.subject);
		//jQuery('.status',ticketCard).html(issue.status.name);
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
		
		
		if(issue.custom_fields){
			for (var i=0;i<issue.custom_fields.length;i++){
				if(issue.custom_fields[i].id==12){
					//Nom du demandeur
					if(issue.custom_fields[i].value=="Moi"){
						jQuery('.demandeur',ticketCard).html(issue.author.name);
					}else{
						jQuery('.demandeur',ticketCard).html(issue.custom_fields[i].value);
					}
				}
				if(issue.custom_fields[i].id==13){
					//Date souhaité
					if(issue.custom_fields[i].value){
						jQuery('.requestedDate',ticketCard).html(dateFormat(new Date(issue.custom_fields[i].value),"yyyy-mm-dd"));
					}
				}
			}
		}
		
		ticketCard.addClass("priority"+issue.priority.id);
		return ticketCard;
	}

}());

			
			
			
