import { connect, Model } from 'mongoose'
import audience from './models/audience'
import groups from './models/groups'
import teachers from './models/teachers'

export class DBController {
    public readonly AudienceModel!: Model<any>
    public readonly GroupModel!: Model<any>
    public readonly TeachersModel!: Model<any>

    constructor(url: string, user: string, password: string, source: string) {
        this.AudienceModel = audience
        this.GroupModel = groups
        this.TeachersModel = teachers

        connect(
            url,
            {
                authSource: source,
                auth: {
                  username: user,
                  password: password
                }
            },
            (e: any) => console.log(e),
        )
    }
}
