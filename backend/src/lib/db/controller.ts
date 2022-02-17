import { connect, Model } from 'mongoose'
import audience from './models/audience'
import groups from './models/groups'

export class DBController {
    public readonly AudienceModel!: Model<any>
    public readonly GroupModel!: Model<any>

    constructor(url: string, user: string, password: string, source: string) {
        this.AudienceModel = audience
        this.GroupModel = groups

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
