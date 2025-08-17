from flask_restful import Api
import dummy_server.resources as res

API = "/api/v1/"  # optional string


def add_routes(app):
    api = Api(app)

    api.add_resource(res.cosine_data.CosineResource, API + "cosine/<string:layer>/<string:type>/<string:threshold>") # type refers to contextualized or context-0

    return api
