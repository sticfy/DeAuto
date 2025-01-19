let superAdminPermission = [
    "userList",
    "announcementAdd", "announcementUpdate", "announcementDelete", "announcementStatus", "announcementDetails", "announcementActiveList", "announcementListLimit", "announcementList",
    "contentFormatAdd", "contentFormatUpdate", "contentFormatDelete", "contentFormatStatus", "contentFormatDetails", "contentFormatActiveList", "contentFormatListLimit", "contentFormatList",
    "contentTopicAdd", "contentTopicUpdate", "contentTopicDelete", "contentTopicStatus", "contentTopicDetails", "contentTopicActiveList", "contentTopicListLimit", "contentTopicList",
    "contentUpdate", "contentDetails", "contentDynamicDetails",
    "dealerList", "dealerActiveList", "dealerListLimit", "dealerAdd", "dealerUpdate", "dealerDelete", "dealerStatus", "dealerDetails",
    "assignProductToDealer","dealerWiseProductList","productWiseDealerList", "nearestDealerListLimit",
    "designationList", "designationActiveList", "designationListLimit", "designationAdd", "designationUpdate", "designationDelete", "designationStatus", "designationDetails",
    "mediaAdd", "mediaUpdate", "mediaDelete", "mediaStatus", "mediaDetails", "mediaActiveList", "mediaListLimit", "mediaList",
    "eventAdd", "eventUpdate", "eventDelete", "eventStatus", "eventDetails", "eventActiveList", "eventListLimit", "eventList",
    "diseaseAndPestList", "diseaseAndPestActiveList", "diseaseAndPestListLimit", "diseaseAndPestAdd", "diseaseAndPestUpdate", "diseaseAndPestDelete", "diseaseAndPestStatus", "diseaseAndPestDetails",
    "genericGroupList", "genericGroupActiveList", "genericGroupListLimit", "genericGroupAdd", "genericGroupUpdate", "genericGroupDelete", "genericGroupStatus", "genericGroupDetails",
    "helpLineList", "helpLineActiveList", "helpLineListLimit", "helpLineAdd", "helpLineUpdate", "helpLineDelete", "helpLineStatus", "helpLineDetails",
    "moduleList", "moduleActiveList", "moduleListLimit", "moduleAdd", "moduleUpdate", "moduleDelete", "moduleStatus", "moduleDetails",
    "permissionList", "permissionActiveList", "permissionListLimit", "permissionAdd", "permissionUpdate", "permissionDelete", "permissionStatus", "permissionDetails","permissionNotAssignedList",
    "productCompanyList", "productCompanyActiveList", "productCompanyListLimit", "productCompanyAdd", "productCompanyUpdate", "productCompanyDelete", "productCompanyStatus", "productCompanyDetails",
    "productElementList", "productElementActiveList", "productElementListLimit", "productElementAdd", "productElementUpdate", "productElementDelete", "productElementStatus", "productElementDetails",
    "productSolutionList", "productSolutionActiveList", "productSolutionListLimit", "productSolutionAdd", "productSolutionUpdate", "productSolutionDelete", "productSolutionStatus", "productSolutionDetails",
    "productList", "productActiveList", "productListLimit", "productAdd", "productUpdate", "productDelete", "productStatus", "productDetails",
    "roleAdd", "roleUpdate", "roleDelete", "roleStatus", "rolePermissionUpdate", 
    "surveyQuestionList", "surveyQuestionActiveList", "surveyQuestionListLimit", "surveyQuestionAdd", "surveyQuestionUpdate", "surveyQuestionDelete", "surveyQuestionStatus", "surveyQuestionDetails",
    "surveyList", "surveyActiveList", "surveyListLimit", "surveyAdd", "surveyUpdate", "surveyDelete", "surveyStatus", "surveyDetails","surveyPublish","surveyQuestionUnderSurvey","surveySubmit","surveyAnswerSubmissionList","surveyAnswerOfSpecificUser",
    "systemMediaList", "systemMediaActiveList", "systemMediaListLimit", "systemMediaAdd", "systemMediaUpdate", "systemMediaDelete", "systemMediaStatus", "systemMediaDetails",
    "workingMoodList", "workingMoodActiveList", "workingMoodListLimit", "workingMoodAdd", "workingMoodUpdate", "workingMoodDelete", "workingMoodStatus", "workingMoodDetails",
    "genericWiseProductList"
    

];

let systemUserPermission = [
    "announcementListLimit", "announcementDetails", "announcementActiveList",
    "contentFormatDetails", "contentFormatListLimit", "contentFormatActiveList",
    "contentTopicDetails", "contentTopicListLimit", "contentTopicActiveList",
    "contentDetails", "contentDynamicDetails",
    "dealerActiveList", "dealerListLimit", "dealerDetails",
    "designationActiveList", "designationListLimit", "designationDetails",
    "diseaseAndPestActiveList", "diseaseAndPestListLimit", "diseaseAndPestDetails",
    "genericGroupActiveList", "genericGroupListLimit", "genericGroupDetails",
    "helpLineActiveList", "helpLineListLimit", "helpLineDetails",
    "mediaDetails", "mediaListLimit", "mediaActiveList",
    "eventDetails", "eventListLimit", "eventActiveList",
    "permissionDetails", "permissionListLimit", "permissionActiveList",
    "productCompanyDetails", "productCompanyListLimit", "productCompanyActiveList",
    "productElementDetails", "productElementListLimit", "productElementActiveList",
    "productSolutionDetails", "productSolutionListLimit", "productSolutionActiveList",
    "productDetails", "productListLimit", "productActiveList",
    "surveyQuestionActiveList", "surveyQuestionListLimit", "surveyQuestionDetails",
    "surveyActiveList", "surveyListLimit", "surveyDetails",
    "surveyList", "surveyActiveList", "surveyListLimit", "surveyDetails","surveyPublish","surveyQuestionUnderSurveyForApp","surveySubmit",
    "systemMediaActiveList", "systemMediaListLimit", "systemMediaDetails",
    "workingMoodActiveList", "workingMoodListLimit", "workingMoodDetails",
    "genericWiseProductList", "nearestDealerListLimit"

];



let getRouterPermissionList = async (id = 0) => {
    return new Promise((resolve, reject) => {
        if (id === 1) resolve(superAdminPermission);
        else if (id === 2) resolve(systemUserPermission);
        else resolve([]);
    });
}


module.exports = {
    getRouterPermissionList
}