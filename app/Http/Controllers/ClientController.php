<?php

namespace CodeProject\Http\Controllers;

use CodeProject\Repositories\ClientRepository;
use CodeProject\Services\ClientService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ClientController extends Controller
{
    /**
     * @var ClientRepository
     */
    private $repository;
    /**
     * @var ClientService
     */
    private $service;

    public function __construct(ClientRepository $repository, ClientService $service)
    {
        $this->repository = $repository;
        $this->service = $service;
    }

    public function index()
    {
        try {
            return $this->repository->all();
        } catch (ModelNotFoundException $e) {
            return [
                'error' => true,
                'message' => 'Cliente não encontrado'
            ];
        } catch (NotFoundHttpException $e) {
            return [
                'error' => true,
                'message' => 'nenhum cliente existente.'
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'message' => $e->getMessage()
            ];
        }
    }

    public function show($id)
    {
        try {
            return $this->repository->with('project')->find($id);
        } catch (ModelNotFoundException $e) {
            return [
                'error' => true,
                'message' => 'Cliente não encontrado'
            ];
        } catch (NotFoundHttpException $e) {
            return [
                'error' => true,
                'message' => 'Este projeto não existe.'
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'message' => $e->getMessage()
            ];
        }
    }

    public function create(Request $request)
    {
        return $this->service->create($request->all());
    }

    public function update(Request $request, $id)
    {
        return $this->service->update($request->all(), $id);
    }

    public function delete($id)
    {
        return $this->service->delete($id);
    }
}
