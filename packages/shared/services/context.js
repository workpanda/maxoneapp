import { API, Auth } from "aws-amplify";

export default class ContextService {
  buildUserContext = async (username, tenant) => {

    // Note, returns userContext and app Context
    var context = await Auth.currentSession()
    .then(auth =>{
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        },
        body:{ tenant: tenant }
      }
      // console.log('auth.idToken.jwtToken', auth.idToken.jwtToken)
      return API.post("auth", `/auth/userContext`, options);
    })
    return context
  }

  buildAppContext = async (userContext) => {
    var appContext = await Auth.currentSession()
    .then(auth =>{
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        },
        body:userContext
      }
      return API.post("auth", `/auth/appContext`, options);
    })
    return appContext
  }

  changeAppContext = async (userContext, contextId) => {
    var appContext = await Auth.currentSession()
    .then(auth =>{
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        },
        body:userContext
      }
      return API.post("auth", `/auth/appContext/${contextId}`, options);
    })
    return appContext
  }

  isStaffPermitted = (team, permission) => {
    if(team.staffPermissions && team.staffPermissions[permission] == false) return false
    return true
  }

}
